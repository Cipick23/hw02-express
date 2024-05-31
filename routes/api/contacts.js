import { Router } from "express";
import ContactController from "../../controller/contactController.js";
import Joi from "joi";

const router = Router();
const STATUS_CODES = {
  success: 200,
  deleted: 204,
  error: 500,
};

function checkPhone(value) {
  return /^(\(\d{3}\)\s\d{3}-\d{4})$/.test(value);
}

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .custom((value, helpers) => {
      if (!checkPhone(value)) {
        return helpers.message(
          "Please enter a phone number in the format (XXX) XXX-XXXX"
        );
      }
      return value;
    })
    .required(),
  favorite: Joi.boolean(),
});

// const updateSchema = Joi.object({
//   name: Joi.string(),
//   email: Joi.string().email(),
//   phone: Joi.string().custom((value, helpers) => {
//     if (!checkPhone(value)) {
//       return helpers.message(
//         "Please enter a phone number in the format (XXX) XXX-XXXX"
//       );
//     }
//     return value;
//   }),
//   favorite: Joi.boolean(),
// }).min(1);

/* GET localhost:3000/api/contacts */
router.get("/", async (req, res) => {
  try {
    const contacts = await ContactController.listContacts();

    res.status(STATUS_CODES.success).json({
      message: "Lista a fost returnată cu succes",
      data: contacts,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

/* GET localhost:3000/api/contacts/:id */
router.get("/:contactId", async (req, res) => {
  try {
    const contact = await ContactController.getContactById(
      req.params.contactId
    );
    if (!contact) {
      throw new Error("Contactul nu a fost găsit");
    }
    res.status(STATUS_CODES.success).json({
      message: "Contactul a fost returnat cu succes",
      data: contact,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

/* POST localhost:3000/api/contacts */
router.post("/", async (req, res) => {
  try {
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw new Error(error.details[0].message);
    }

    const contact = req.body;
    await ContactController.addContact(contact);
    res.status(201).json({
      message: `Contactul ${contact.name} a fost adăugat cu succes.`,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

// PUT localhost:3000/api/contacts/:id
// router.put("/:contactId", async (req, res) => {
//   try {
//     const { error } = updateSchema.validate(req.body);
//     if (error) {
//       throw new Error(error.details[0].message);
//     }

//     const updatedContact = await ContactsService.updateContact(
//       req.body,
//       req.params.contactId
//     );
//     res.status(STATUS_CODES.success).json({
//       message: "Contactul a fost actualizat cu succes",
//       data: updatedContact,
//     });
//   } catch (error) {
//     respondWithError(res, error);
//   }
// });

// DELETE localhost:3000/api/contacts/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await ContactController.removeContact(req.params.id);
    res.status(STATUS_CODES.deleted).json({
      message: "Contactul a fost șters cu succes",
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

/**
 * Handles Error Cases
 */
function respondWithError(res, error) {
  console.error(error);
  res.status(STATUS_CODES.error).json({ message: error.message });
}

export default router;
