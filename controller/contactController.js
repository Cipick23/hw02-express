// import fs from "fs";
// import { v4 as uuidv4 } from "uuid";
import Contact from "../models/contacts.js";

const ContactController = {
  listContacts,
  getContactById,
  addContact,
  //   updateContact,
  removeContact,
};

async function listContacts() {
  console.log("---List Contacts ---");
  try {
    return Contact.find();
  } catch (error) {
    console.error(error);
  }
}

async function getContactById(id) {
  console.log(`--- List Contacts  by id #{id} ---`);
  try {
    return Contact.findById(id);
  } catch (error) {
    console.error(error);
  }
}

async function addContact(contact) {
  return Contact.create(contact);
}

// async function updateContact(updatedContact, contactId) {
//   const index = contacts.findIndex((contact) => contact.id === contactId);
//   if (index === -1) {
//     throw new Error("Contactul nu a fost găsit.");
//   }

//   contacts[index] = { ...updatedContact, id: contactId };
//   return contacts[index];
// }

async function removeContact(id) {
  return Contact.findByIdAndDelete(id);
}

export default ContactController;
