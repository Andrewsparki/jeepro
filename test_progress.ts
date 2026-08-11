import { updateChapterProgress, updateSubjectProgress } from './features/study/services/progress';

async function test() {
  try {
    console.log("Testing individual chapter completion...");
    const res1 = await updateChapterProgress("physics", "kinematics", "Mastered");
    console.log("Result 1:", res1 ? res1.length : null);
    
    console.log("Testing mark entire Physics subject complete...");
    const res2 = await updateSubjectProgress("physics", "Mastered");
    console.log("Result 2:", res2 ? res2.length : null);
    
    console.log("Testing reset subject progress...");
    const res3 = await updateSubjectProgress("physics", "Not Started");
    console.log("Result 3:", res3 ? res3.length : null);
    
    console.log("All backend operations succeeded without 'uuid = text' errors!");
  } catch (e) {
    console.error("Test failed:", e);
  }
}
test();
