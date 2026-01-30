import { initializeEmailService } from "../helper-service/email.helper";
import { connectDatabase } from "../persistence-service/database";


export const initializeBusinessService = async () => {
    await connectDatabase(); 
    initializeEmailService();
}