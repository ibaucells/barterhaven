import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000; // Define the PORT variable

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbURI = 'mongodb+srv://barteruser:barteruserpass@cluster0.nnp44.mongodb.net/';

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");

// Ensure "uploads" directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the full path to the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original filename
  },
});
// Set up Multer to handle file uploads
const upload = multer({ storage });

// Define a user schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: {
      validator: (email) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
      message: "Invalid email format",
    },
  },
  password: { type: String, required: true },
  userId: { type: Number, unique: true, required: true },
  profilePicture: { type: String, default: "" }, // Store image path
  likedProducts: [{ type: String, ref: "Product" }], // Array of product IDs
});

// Set up the mongoose model
const User = mongoose.model("User", userSchema);


// Define a product schema and model
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: Number, required: true },
  images: [{ type: String }], // Array of image URLs
  location: { 
    type: String,
    enum: [
      "Ciutat Vella", "Eixample", "Sants-Montjuïc", "Les Corts", "Gràcia", 
      "Horta-Guinardó", "Sant Andreu", "Sant Martí", "Nou Barris", "Sarrià-Sant Gervasi"
    ],
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Electronics", "Clothing", "Furniture", "Books", "Toys", 
      "Sports", "Home Appliances", "Music", "Tools", "Miscellaneous"
    ],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  state: { type: String, enum: ["active", "removed", "reserved", "exchanged"], default: "active" },
  exchangeProposals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Proposal" }]
});
// Set up the mongoose model
const Product = mongoose.model("Product", productSchema);

//  Define a proposal schema and model
const proposalSchema = new mongoose.Schema({
  initiatorId: { type: Number, ref: "User", required: true }, // User who proposed the exchange
  receiverId: { type: Number, ref: "User", required: true }, // User receiving the proposal
  createdAt: { type: Date, default: Date.now }, // Proposal date
  initiatorItems: [{ type: String, ref: "Product", required: true }], // Items offered by the initiator
  receiverItems: [{ type: String, ref: "Product" }], // Items proposed by the receiver (optional, if counter-offering)
  lastStateDate: { type: Date, default: Date.now }, // Proposal date
  state: { 
    type: String, 
    enum: ["unanswered", "pending", "accepted", "declined", "exchanged"], 
    default: "unanswered" 
  }
});
// Set up the mongoose model
const Proposal = mongoose.model("Proposal", proposalSchema);

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Connection error', error));

// Check MongoDB connection status
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established successfully.");
});
// Handle connection errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});
// Handle disconnection
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// USER-RELATED OPERATIONS

// Helper: Generate the next available user ID
async function generateUserId() {
  const lastUser = await User.findOne().sort({ userId: -1 }); // Get latest user
  return lastUser ? lastUser.userId + 1 : 1;
}

// User profile picture upload endpoint
app.post('/upload', upload.single('profilePicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).send(`File uploaded: ${req.file.filename}`);
});

// Register a New User
app.post("/users/register", upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, name, surname, email, password } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : "";

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "Username or Email already in use." });
    }

    // Generate unique user ID
    const userId = await generateUserId();

    // Create new user
    const newUser = new User({ username, name, surname, email, password, userId, profilePicture });
    await newUser.save();
    
    res.status(201).json({ message: "User registered successfully!", userId, profilePicture });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user." });
  }
});


// Fetch all users
app.get("/users/all", async (req, res) => {
  try {
    const users = await User.find({}, "userId username email");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Serve static files for profile pictures
app.use("/uploads", express.static(uploadDir));

// Fetch user by ID
app.get("/users/find/:id", async (req, res) => {
  const id = req.params.id; // Get `id` from URL params
  try {
    const user = await User.findOne({ userId: Number(id) });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user); // Send user data
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// Login User
app.post("/users/login", async (req, res) => {
  try {
    const {email, password } = req.body;
    const user = await User.findOne({ email }); // Check if a user with the given email exists in the database
    
    // Check if the user exists
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the stored password
    const isPasswordMatch = user.password === password;

    // If the password doesn't match, return an error
    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    // Success - email and password match
    res.status(200).json({ message: "Login successful", user });
} catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
}
});

// Update User Profile
app.patch("/users/update/:id", async (req, res) => {
  const id = req.params.id; // Extract user ID from request parameters
  const { likedProducts, action, ...otherUpdates } = req.body; // Extract likedProducts and action from request body

  try {
    let updateQuery = {};
    // Check if likedProducts and action are provided
    if (likedProducts && action) {
      // Handle likes separately
      updateQuery = action === "add"
        ? { $addToSet: { likedProducts } }
        : { $pull: { likedProducts } };
    } else if (Object.keys(otherUpdates).length > 0) {
      // Handle normal profile updates
      updateQuery = { $set: otherUpdates };
    } else {
      return res.status(400).send("No valid update fields provided.");
    }
    // Update the user profile in the database
    const result = await User.updateOne({ userId: Number(id) }, updateQuery);

    // Check if the user was found and updated
    if (result.matchedCount === 1) {
      res.status(200).send("User profile updated successfully.");
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).send("Error updating user profile.");
  }
});


// PRODUCT-RELATED OPERATIONS

// Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

// Create a new product
app.post("/products", upload.fields([{ name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const requiredFields = ["productId", "title", "description", "userId", "category", "location", "state"];

    // Check if any required field is missing or empty
    const missingField = requiredFields.find(field => !req.body[field]);
    if (missingField) {
      return res.status(400).json({ error: `${missingField} is required.` });
    }

    // Create product with all provided fields
    const product = new Product({
      ...req.body,
      createdAt: new Date(), // Set createdAt to now
      exchangeProposals: req.body.exchangeProposals || [], // Ensure it's an array
    });

    // Handle file uploads
    if (req.files && req.files.images) {
      product.images = req.files.images.map(file => `/uploads/${file.filename}`); // Store file paths
    }

    await product.save(); // Save the product to the database
    return res.status(201).json(product); // Respond with the created product
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: "An error occurred while creating the product." });
  }
});

// Fetch product by ID
app.get("/products/find/:id", async (req, res) => {
  const id = req.params.id; // Get `id` from URL params
  try {
    const item = await Product.findOne({ productId: id });
    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch item." });
  }
});

// Update a product's state by ID and handle image updates
app.put("/products/:id", upload.fields([{ name: 'images', maxCount: 10 }]), async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  // Check if the product exists
  const product = await Product.findOne({ productId: id });
  if (!product) {
    return res.status(404).send('Product not found');
  }

  // Handle image updates if new images are uploaded
  if (req.files && req.files.images) {
    updates.images = req.files.images.map(file => `/uploads/${file.filename}`);
    console.log("New images uploaded:", updates.images);
  }

  try {
    const result = await Product.updateOne(
      { productId: id },
      { $set: updates }
    );

    if (result.matchedCount === 1) {
      res.status(200).send('Product updated successfully');
    } else {
      res.status(400).send('Failed to update product'); // More descriptive error
    }
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).send('Error updating product.');
  }
});



// Delete a product by ID
app.delete('/products/delete/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const result = await Product.findByIdAndDelete(id);
      
      if (!result) {
          return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

// PROPOSAL-RELATED OPERATIONS

// Fetch all proposals
app.get("/proposals", async (req, res) => {
  try {
    const proposals = await Proposal.find();
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch proposals." });
  }
});

// Create a new proposal
app.post("/proposals", async (req, res) => {
  console.log(req.body);
  try {
    const requiredFields = ["initiatorId", "receiverId", "initiatorItems"];
    const missingField = requiredFields.find(field => !req.body[field]);
    if (missingField) {
      return res.status(400).json({ error: `${missingField} is required.` });
    }
    // Create proposal with all provided fields
    const proposal = new Proposal({
      ...req.body,
      createdAt: new Date(),
      receiverItems: req.body.receiverItems || [],
      history: [],
    });

    await proposal.save();
    return res.status(201).json(proposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    return res.status(500).json({ error: "An error occurred while creating the proposal." });
  }
});

// Fetch a user's proposal by its user ID
app.get("/proposals/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const proposals = await Proposal.find({ 
      $or: [
      { initiatorId: id },
      { receiverId: id }
      ]
    });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch proposals." });
  }
});

// Update a proposal's state
app.put("/proposals/:id", async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  updates.lastStateDate = new Date();
  try {
    const result = await Proposal.updateOne(
      { _id: id },
      { $set: updates }
    );
    if (result.matchedCount === 1) {
      res.status(200).send('Proposal updated');
    } else {
      res.status(404).send('Proposal not found');
    }
  } catch (err) {
    res.status(500).send('Error updating proposal.');
  }
});

// Delete a proposal by ID
app.delete('/proposals/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const result = await Proposal.findByIdAndDelete(id);
      
      if (!result) {
          return res.status(404).json({ message: "Proposal not found" });
      }

      res.status(200).json({ message: "Proposal deleted successfully" });
  } catch (error) {
      console.error("Error deleting proposal:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});
