import { filterMessagesByAge } from "../utils/searchUtils.js"

export async function searchMenu(messages, rl){
  let isRunning = true; 


  while(isRunning){
    console.log("\n============ Seach Emails ==============");
    console.log("1. Search by Age");
    console.log("2. Search by Category");
    console.log("3. Search by Subscriptions");
    console.log("4. Search by Keyword");
    console.log("5. Advanced Search");
    console.log("6. Return to Main Menu");


    const choice = await rl.question("Choose an option: ");
    
    switch(choice.trim()){
      case "1":
        const input = await rl.question("Find emails older than how many days? ");


        if(input.trim() === "") {
          console.log("Please enter a number.");
          break;
        }

        const days = Number(input);

        if(!Number.isFinite(days) || days < 0){
          console.log("Invalid number of days.");
          break;
        }

        const results = filterMessagesByAge(messages, days);

        console.log(`\nFound ${results.length} emails older than ${days} days.`);

        console.table(
          results.map(({id, from, subject, date}) => ({
            id, 
            from,
            subject, 
            date 
          }))
        );

        break;
      case "2":
        console.log("Search by Category");
        break;
      case "3":
        console.log("Search Subscriptions");
        break;
      case "4":
        console.log("Search by Keyword");
        break;
      case "5":
        console.log("Advanced Search");
        break;
      case "6":
        isRunning = false;
        break;

      default:
        console.log("Invalid option. Please try again.");
    }
    
  }
}
