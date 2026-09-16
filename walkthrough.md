# Walkthrough — Private Chat Initialization & Realtime Fixes

We have resolved all initialization failures and Supabase Realtime lifecycle errors for the **JEE Pro Private Chat** feature.

---

## 1. Problem Diagnosis & Root Causes

### Error 1: Realtime Listener Registration After Subscribe
```text
cannot add `postgres_changes` callbacks for realtime:inbox_conversations_5e3704fc-0af0-4cd1-9b79-3047b9ebeca6 after `subscribe()`.
Stack: useDirectConversations.useEffect (features/chat/hooks/use-direct-conversations.ts:84)
```
- **Root Cause**:
  1. **Asynchronous Channel Removal in `@supabase/realtime-js`**:
     In Supabase's JavaScript client, `supabase.removeChannel(channel)` does not remove the channel synchronously; it calls `channel.unsubscribe().then(...)` and filters `this.channels` asynchronously on the microtask queue.
  2. **Synchronous Effect Re-mounts & Concurrent Hook Invocations**:
     In Next.js React StrictMode and Fast Refresh, effects unmount and re-mount synchronously. Because `this.channels` still contains the channel from the previous mount (which was already in the `joining` or `joined` state), `supabase.channel(channelName)` returns that existing channel instance.
     When `channel.on("postgres_changes", ...)` was subsequently called on that channel, `@supabase/realtime-js` threw:
     `cannot add 'postgres_changes' callbacks for realtime:... after 'subscribe()'`.
  3. **Duplicate Hook Invocations**:
     `GlobalChatView` called `useDirectConversations()` to render the unread badge on the "Direct Messages" tab. When switching tabs, `DirectConversationsList` mounted and also called `useDirectConversations()`, attempting to register callbacks on the same channel name while the first was already subscribed.

---

### Error 2: `[usePrivateChat] Init error: {}` & "Conversation Unavailable"
```text
[usePrivateChat] Init error: {}
Stack: features/chat/hooks/use-private-chat.ts:77
UI: "Conversation Unavailable" / "Failed to initialize conversation."
```
- **Root Cause**:
  1. **PostgreSQL RPC Syntax Error**: In `supabase/migrations/015_private_chat.sql`, the `get_or_create_conversation` RPC contained:
     ```sql
     INSERT INTO public.conversations (user1_id, user2_id)
     VALUES (v_u1, v_u2)
     ON CONFLICT (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)) -- INVALID SYNTAX
     ```
     PostgreSQL requires `ON CONFLICT` to target either a named constraint or explicit columns with a direct UNIQUE index matching the columns, not functional expressions like `LEAST`/`GREATEST` without matching syntax. This caused the RPC to fail with an error.
  2. **RLS INSERT Policy Missing**: When the RPC failed, the service layer fell back to client-side direct inserts into `public.conversations` and `public.conversation_participants`. However, neither table had an `INSERT` or `UPDATE` RLS policy defined for authenticated users (only `SELECT` was permitted). The direct insert was therefore rejected by PostgreSQL with RLS violation error `42501`.
  3. **Empty Error Logging**: In `use-private-chat.ts`, the error handler used `err instanceof Error ? err.message : ...`. When Supabase returns a `PostgrestError`, it is a plain JavaScript object `{ message, code, details, hint }`, not an instance of the native JS `Error` class. As a result, `console.error(err)` produced `{}` in devtools, concealing the underlying message.
  4. **Unsafe Fallback in Service**: The service layer caught all errors blindly and attempted direct inserts even for genuine authorization failures (such as non-friends).

---

## 2. Changes Made & Architecture Fixes

### A. Database Migration (`supabase/migrations/015_private_chat.sql`)
1. **Schema Uniqueness Constraint**:
   - Enforced canonical ordering rule: `CONSTRAINT chk_conversations_distinct CHECK (user1_id < user2_id)`.
   - Added standard multi-column unique constraint: `CONSTRAINT uq_conversations_pair UNIQUE (user1_id, user2_id)`.
2. **Fixed RPC `get_or_create_conversation`**:
   - Strictly normalizes IDs: `v_u1 := LEAST(auth.uid(), p_other_user_id); v_u2 := GREATEST(auth.uid(), p_other_user_id);`.
   - Uses clean, standard conflict target: `ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = now() RETURNING id INTO v_conv_id;`.
3. **Robust RLS Policies**:
   - Retained strict `friendships.status = 'accepted'` authorization checks.
   - Added `INSERT` policy for `conversations` allowing participants to insert if canonical ordering is satisfied and they are accepted friends.
   - Added `INSERT` and `UPDATE` policies for `conversation_participants` allowing users to register their own participation.

---

### B. Service Layer (`features/chat/services/private-chat.service.ts`)
1. **Canonical ID Ordering**:
   - Guaranteed client queries always query `user1_id = u1 AND user2_id = u2` where `u1 < u2`.
2. **Preserved PostgrestError Details**:
   - Wrapped Supabase errors to preserve `message`, `code`, `details`, and `hint`.
3. **Strict Authorization vs Fallback Handling**:
   - If the RPC returns a permission/authorization error or friend check rejection, it re-throws immediately rather than masking it.
   - Only falls back to direct insert if the RPC function itself is missing (`42883` or `PGRST202`).

---

### C. Inbox Hook & Components (`use-direct-conversations.ts` & `direct-conversations-list.tsx` & `global-chat-view.tsx`)
1. **Unique Per-Instance Channel Topic**:
   - Channel topic dynamically generated: `inbox_conversations_${user.id}_${instanceId}`.
   - Guaranteed to create a fresh `closed` channel instance with zero risk of collision with previously subscribed channels.
2. **Stale Channel Teardown**:
   - Iterates `supabase.getChannels()` and unsubscribes/removes any lingering channels matching `inbox_conversations_${user.id}`.
3. **Parent-Child State Sharing (`DirectConversationsList`)**:
   - Added optional `conversations`, `isLoading`, `error` props to `DirectConversationsList`.
   - `GlobalChatView` passes its existing data to `DirectConversationsList`, preventing duplicate hook mounts.
   - Added `enabled = true` flag to `useDirectConversations` so child component disables secondary fetch/subscription when parent props are present.

---

### D. Private Chat Hook (`features/chat/hooks/use-private-chat.ts`)
1. **Unique Per-Instance Channel Topic**:
   - Channel topic dynamically generated: `dm_${conversationId}_${user.id}_${instanceId}`.
   - Stale channels cleaned up via `supabase.getChannels()`.
2. **Proper Error Formatting & Logging**:
   - Introduced `formatErrorDetails(err)` helper logging `{ message, code, details, hint }` safely without swallowing `PostgrestError`.
3. **Global Presence Integration**:
   - Connected secondary presence listener to shared application channel `"jee_global_chat"` to accurately reflect when the friend is active in JEE Pro.
4. **Race Condition & Cancellation Guards**:
   - Added `let ignore = false; return () => { ignore = true; };` inside the load effect to discard responses from obsolete init calls.
   - Clean retry handler that resets state and re-invokes initialization.

---

### E. Component Updates (`private-chat-message-list.tsx` & `private-chat-view.tsx`)
1. **Retry Propagation**:
   - Wires `onRetry={retry}` from `usePrivateChat` to `PrivateChatMessageList`'s "Try Again" button.
2. **Friend Status Guidance**:
   - Renders "Connect as Friends to Chat" with link to `/friends` when unauthorized, and "Conversation Unavailable" with "Try Again" for transient network issues.
3. **Locomotive Scroll Safety**:
   - Internal chat message scroll container uses `overscroll-contain overflow-y-auto`, preserving application smooth-scroll.

---

## 3. Verification & Validation Results

1. **TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Zero errors)
   ```
2. **ESLint Verification**:
   ```bash
   npx eslint features/chat/ app/chat/
   # Exit code: 0 (Zero warnings, zero errors)
   ```
3. **Next.js Production Build**:
   ```bash
   npm run build
   # Exit code: 0 (Compiled successfully with Turbopack, 40/40 routes generated)
   ```
