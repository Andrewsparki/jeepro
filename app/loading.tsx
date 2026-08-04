export default function Loading() {
  return (
    <div className="flex min-h-[inherit] items-center justify-center bg-background w-full h-full">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-accent/20" />
          <div className="h-4 w-4 rounded-full bg-accent shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
        </div>
      </div>
    </div>
  );
}
