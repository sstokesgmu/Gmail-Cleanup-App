import { getStatistics } from "../services/statisticsService.js";

export async function statisticsMenu(rl) {
  let isRunning = true;

  while(isRunning) {
    const stats = getStatistics();

    console.log("\n================ Cleanup Statistics ================");

    console.log(`Initial emails: ${stats.initialEmailCount}`);
    console.log(`Remaining emails: ${stats.remainingEmailCount}`);
    console.log(`Successfully trashed: ${stats.deletedCount}`);
    console.log(`Failed deletion attempts: ${stats.failedCount}`);
    console.log(`Cleanup Progress: ${stats.cleanupPrecentage.toFixed(2)}%`);
    

    console.log(`\n1. View deleted emails by sender`);
    console.log(`2. View session information`);
    console.log(`3. Return to main menu`);
  

    const choice = await rl.question("Choose an option: ");

    switch (choice.trim()){
      case "1": {
        if(stats.deletedBySender.length === 0){
          console.log("No emails have been deleted.");
          break;
        }

        console.log("\n============ Deleted Emails by Sender ============");

        console.table(stats.deletedBySender);

        await rl.question("Press Enter to continue ... ");
        break;
      }

      case "2": {
        console.log("\n ============== Session Information =============== ");
        console.log(
          `Session started:  ${ts.sessionStartedAt?.toLocaleString() || "Not Initialized"}`
        );

        await rl.qustion("Press Enter to continue ... ");
        break;
      }

      case "3":
        isRunning = false;
        break;

      default:
        console.log("Invalid option.");
        break;
    }
  }
}
