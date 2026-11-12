/*
 * Starts application
 * initialize Gmail Authentication
 * launch command line menu 
 */

import {authenticate} from "./auth/googleAuth.js";
import {createGmailClient} from "./services/gmailServices.js";
import {startMenu} from "./cli/mainMenu.js";

/*
 * Main entry point for Gmail Cleaner 
 */

async function main()
{
  console.log("====================================");
  console.log("          GMAIL CLEANER             ");
  console.log("====================================");


  try {
      const mockMode = process.env.MOCK_MODE === "true";
      
      if(mockMode) {
        console.log("Running in MOCK Mode\n");

        //! No Gmail authentication needed 
        await startMenu(null,  {mockMode: true});
      } else {
       //Step 1: Authenticate with Google
      console.log("Authenticating with GMAIL... \n");
      const auth = await authenticate();

      //Step 2: Create the Gmail API client 
      const gmail = createGmailClient(auth);

      //Step 3: Start the interactive menu
      console.log("Successfully connected to GMAIL!\n");
      await startMenu(gmail, {mockMode: false});
    }
  } catch (error) {
    console.error("Application error:", error.message);
    console.error("Stack trace:", error.stack);
    process.exitcode = 1; //?This is interesting
  }
}

//Start application
main();

