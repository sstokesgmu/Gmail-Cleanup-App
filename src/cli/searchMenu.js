import { filterMessagesByAge, filterMessagesBySender, filterMessagesByCategory } from "../utils/searchUtils.js"

export async function searchMenu(messages, rl){
  let isRunning = true; 


  while(isRunning){
    console.log("\n============ Seach Emails ==============");
    console.log("1. Search by Age");
    console.log("2. Search by Sender Name");
    console.log("3. Search by Category");
    console.log("4. Combine filters");
    console.log("5. Return to the Main Menu");


    const choice = await rl.question("Choose an option: ");
    switch(choice.trim())
    {
      case "1": {
        const input = await rl.question("Find emails older than how many days?");

        if(input.trim() === ""){
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
          results.map(({id, from, subject, date}) =>({
            id, from, subject, date
          }))
        );
        break;
      }

      case "2" : {
        const query = await rl.question("Enter sender name or email: ");

        const results = filterMessagesBySender(messages, query);

        console.log(`\nFound ${results.length} matchting emails.`);

        console.table(
          results.map(({id, from, subject, date}) => ({
            id, from, subject, date 
          }))
        );
        break;
      }

      case "3" : {
        console.log("\nAvailable categories:");
        console.log("1. Primary");
        console.log("2. Promotions");
        console.log("3. Social");
        console.log("4. Updates");
        console.log("5. Forums");


        const input = await rl.question("Choose a category (1-5)");

        const categories = ["primary", "promotions", "social", "updates", "forums"];

        const index = Number(input) - 1;

        if(input.trim() === "" || !Number.isInteger(index) || 
        index < 0 || index >= categories.length) {
          console.log("Invalid category selection.");
          break;
        }

        const results = filterMessagesByCategory(messages, categories[index]);

        console.log(`\nFound ${results.length} emails in ${categories[index]}.`);

        console.table(
          results.map(({id, from, subject, date}) => ({
            id, from, subject, date 
          }))
        );
        break;
      }

      case "4" : {
        console.log("Search by keyword - Coming Soon");
        break;
      }

      case "5" : {
        console.log("Advanced Search - Coming Soon");
        break;
      }

      case "6": {
        isRunning = false;
        break;
      }

      default: {
        console.log("Invalid option. Please try again.");
      }

    }
  }
}
