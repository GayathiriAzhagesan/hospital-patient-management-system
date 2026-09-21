import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedDatabase = async () => {
  console.log("🌱 Starting Medicare Portal Database Seeding...");

  const conn = await connectDB();
  if (!conn) {
    console.error("❌ Could not connect to MongoDB Atlas. Please check MONGO_URI in .env");
    process.exit(1);
  }

  try {
    // 1. Clear existing collections
    console.log("🧹 Clearing existing collections...");
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});

    // 2. Create standard persona accounts
    console.log("👤 Creating role-based user accounts...");
    const users = await User.create([
      {
        name: "Dr. Sarah Mitchell, MD",
        email: "sarah.mitchell@medicare.health",
        password: "Password123!",
        role: "Doctor",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
        title: "Chief of Cardiology",
        department: "Cardiology",
        phone: "+1 (555) 234-5678",
      },
      {
        name: "James Rodriguez",
        email: "james.rodriguez@email.com",
        password: "Password123!",
        role: "Patient",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        title: "Patient Member",
        department: "Outpatient Care",
        phone: "+1 (555) 345-6789",
      },
      {
        name: "Alex Chen, PharmD",
        email: "alex.chen@medicare.health",
        password: "Password123!",
        role: "Pharmacist",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        title: "Lead Clinical Pharmacist",
        department: "Central Pharmacy",
        phone: "+1 (555) 456-7890",
      },
      {
        name: "Elena Rostova",
        email: "elena.rostova@medicare.health",
        password: "Password123!",
        role: "Admin",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        title: "Hospital System Administrator",
        department: "Operations & Governance",
        phone: "+1 (555) 567-8901",
      },
    ]);

    const doctorUser = users[0];
    const patientUser = users[1];

    // 3. Create Doctor Profiles
    console.log("🩺 Creating clinical doctor directories...");
    const doctors = await Doctor.create([
      {
        name: "Dr. Sarah Mitchell, MD",
        specialty: "Cardiology",
        department: "Cardiology & Critical Care",
        email: "sarah.mitchell@medicare.health",
        phone: "+1 (555) 234-5678",
        shift: "Morning",
        availableDays: ["Monday", "Wednesday", "Friday"],
        consultationFee: 800,
        roomNumber: "Room 402 - Wing A",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
        qualifications: "MD (Johns Hopkins), FACC",
        userId: doctorUser._id,
      },
      {
        name: "Dr. Marcus Vance, MD",
        specialty: "Neurology",
        department: "Neurosciences Institute",
        email: "marcus.vance@medicare.health",
        phone: "+1 (555) 678-1234",
        shift: "Morning",
        availableDays: ["Tuesday", "Thursday"],
        consultationFee: 1200,
        roomNumber: "Room 310 - Wing B",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        qualifications: "MD, PhD (Harvard Medical School)",
      },
      {
        name: "Dr. Emily Zhang, MD",
        specialty: "Pediatrics",
        department: "Children's Health Pavilion",
        email: "emily.zhang@medicare.health",
        phone: "+1 (555) 789-2345",
        shift: "Evening",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        consultationFee: 600,
        roomNumber: "Room 205 - Pediatrics",
        avatar: "https://images.unsplash.com/photo-1594824813593-9c8828bca612?w=150&auto=format&fit=crop&q=80",
        qualifications: "MD, FAAP",
      },
      {
        name: "Dr. Robert Patel, MD",
        specialty: "Orthopedic Surgery",
        department: "Musculoskeletal & Trauma",
        email: "robert.patel@medicare.health",
        phone: "+1 (555) 890-3456",
        shift: "Morning",
        availableDays: ["Wednesday", "Thursday", "Friday"],
        consultationFee: 900,
        roomNumber: "Room 512 - Surgery Wing",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
        qualifications: "MD, FAAOS",
      },
    ]);

    // 4. Create Patients with Vitals & Prescriptions
    console.log("📋 Seeding patient records and EHR data...");
    const patients = await Patient.create([
      {
        firstName: "James",
        lastName: "Rodriguez",
        dob: "1988-04-12",
        gender: "male",
        phone: "+1 (555) 345-6789",
        email: "james.rodriguez@email.com",
        address: "742 Evergreen Terrace, Springfield, OR",
        bloodGroup: "O+",
        allergies: "Penicillin, Pollen",
        history: "Mild hypertension diagnosed in 2022. No previous hospitalizations.",
        vitals: {
          bloodPressure: "124/82 mmHg",
          heartRate: "70 bpm",
          temperature: "98.4 °F",
          oxygenLevel: "99%",
        },
        prescriptions: [
          {
            medication: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily with breakfast",
            prescribedBy: "Dr. Sarah Mitchell, MD",
            date: "2026-03-01",
            status: "Active",
          },
          {
            medication: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily at bedtime",
            prescribedBy: "Dr. Sarah Mitchell, MD",
            date: "2026-03-01",
            status: "Dispensed",
          },
        ],
        userId: patientUser._id,
      },
      {
        firstName: "Claire",
        lastName: "Underwood",
        dob: "1975-08-23",
        gender: "female",
        phone: "+1 (555) 432-8765",
        email: "claire.u@example.com",
        address: "1600 Pennsylvania Ave, Washington, DC",
        bloodGroup: "A+",
        allergies: "Sulfa drugs",
        history: "Type 2 Diabetes controlled with diet and Metformin.",
        vitals: {
          bloodPressure: "118/76 mmHg",
          heartRate: "68 bpm",
          temperature: "98.6 °F",
          oxygenLevel: "98%",
        },
        prescriptions: [
          {
            medication: "Metformin HCl",
            dosage: "500mg",
            frequency: "Twice daily with meals",
            prescribedBy: "Dr. Marcus Vance, MD",
            date: "2026-02-15",
            status: "Active",
          },
        ],
      },
      {
        firstName: "David",
        lastName: "Kim",
        dob: "1995-11-03",
        gender: "male",
        phone: "+1 (555) 987-6543",
        email: "david.kim@example.com",
        address: "88 Market St, San Francisco, CA",
        bloodGroup: "B+",
        allergies: "None reported",
        history: "Right knee arthroscopy in 2024. Routine recovery.",
        vitals: {
          bloodPressure: "115/75 mmHg",
          heartRate: "74 bpm",
          temperature: "98.7 °F",
          oxygenLevel: "100%",
        },
        prescriptions: [],
      },
    ]);

    // 5. Create Appointments
    console.log("📅 Scheduling realistic appointments...");
    await Appointment.create([
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        patientName: `${patients[0].firstName} ${patients[0].lastName}`,
        doctorName: doctors[0].name,
        date: "2026-09-24",
        time: "10:00 AM",
        reason: "Cardiology follow-up & ECG review",
        status: "Scheduled",
        notes: "Monitor BP response to adjusted Lisinopril dosage.",
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[1]._id,
        patientName: `${patients[1].firstName} ${patients[1].lastName}`,
        doctorName: doctors[1].name,
        date: "2026-09-25",
        time: "11:30 AM",
        reason: "Neurological consultation for chronic headaches",
        status: "Scheduled",
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[3]._id,
        patientName: `${patients[2].firstName} ${patients[2].lastName}`,
        doctorName: doctors[3].name,
        date: "2026-09-18",
        time: "02:00 PM",
        reason: "Post-op knee examination & physical therapy clearance",
        status: "Completed",
        notes: "Joint stability excellent. Cleared for light jogging.",
      },
    ]);

    // 6. Create Invoices
    console.log("💳 Generating billing records and invoices...");
    await Invoice.create([
      {
        invoiceNumber: "INV-2026-001",
        patientId: patients[0]._id,
        patientName: `${patients[0].firstName} ${patients[0].lastName}`,
        items: [
          { description: "Specialist Consultation - Cardiology", quantity: 1, amount: 800 },
          { description: "Electrocardiogram (12-Lead ECG)", quantity: 1, amount: 450 },
          { description: "Lipid Panel & Metabolic Lab Test", quantity: 1, amount: 350 },
        ],
        subtotal: 1600,
        tax: 0,
        total: 1600,
        paid: false,
        paymentStatus: "Pending",
        dueDate: "2026-10-05",
        paymentMethod: "Health Insurance",
        insuranceClaimId: "CLM-BLUE-88219",
      },
      {
        invoiceNumber: "INV-2026-002",
        patientId: patients[1]._id,
        patientName: `${patients[1].firstName} ${patients[1].lastName}`,
        items: [
          { description: "Neurology Specialist Consultation", quantity: 1, amount: 1200 },
          { description: "Brain MRI Scan with Contrast", quantity: 1, amount: 3500 },
        ],
        subtotal: 4700,
        tax: 0,
        total: 4700,
        paid: true,
        paymentStatus: "Paid",
        dueDate: "2026-09-20",
        paymentMethod: "Credit Card",
      },
      {
        invoiceNumber: "INV-2026-003",
        patientId: patients[2]._id,
        patientName: `${patients[2].firstName} ${patients[2].lastName}`,
        items: [
          { description: "Orthopedic Rehabilitation Evaluation", quantity: 1, amount: 900 },
          { description: "Digital Knee X-Ray (2 Views)", quantity: 1, amount: 600 },
        ],
        subtotal: 1500,
        tax: 0,
        total: 1500,
        paid: true,
        paymentStatus: "Paid",
        dueDate: "2026-09-15",
        paymentMethod: "Health Insurance",
        insuranceClaimId: "CLM-AETNA-44910",
      },
    ]);

    console.log("==========================================================");
    console.log("🎉 Medicare Portal Database Seeded Successfully!");
    console.log("==========================================================");
    console.log("🔑 Default Credentials (All passwords: 'Password123!'):");
    console.log("   - Doctor:     sarah.mitchell@medicare.health");
    console.log("   - Patient:    james.rodriguez@email.com");
    console.log("   - Pharmacist: alex.chen@medicare.health");
    console.log("   - Admin:      elena.rostova@medicare.health");
    console.log("==========================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
