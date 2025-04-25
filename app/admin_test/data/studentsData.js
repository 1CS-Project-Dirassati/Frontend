// Levels aligned with Algerian system: Primary (5 years), Middle (4 years), Secondary (3 years)
export let levels = [
  { id: 1, name: "السنة الأولى ابتدائي" }, // Year 1 Primary
  { id: 2, name: "السنة الثانية ابتدائي" }, // Year 2 Primary
  { id: 3, name: "السنة الثالثة ابتدائي" }, // Year 3 Primary
  { id: 4, name: "السنة الرابعة ابتدائي" }, // Year 4 Primary
  { id: 5, name: "السنة الخامسة ابتدائي" }, // Year 5 Primary
  { id: 6, name: "السنة الأولى متوسط" }, // Year 1 Middle
  { id: 7, name: "السنة الثانية متوسط" }, // Year 2 Middle
  { id: 8, name: "السنة الثالثة متوسط" }, // Year 3 Middle
  { id: 9, name: "السنة الرابعة متوسط" }, // Year 4 Middle
  { id: 10, name: "السنة الأولى ثانوي" }, // Year 1 Secondary
  { id: 11, name: "السنة الثانية ثانوي" }, // Year 2 Secondary
  { id: 12, name: "السنة الثالثة ثانوي" }, // Year 3 Secondary
];

// Groups: Multiple classes per level (e.g., 1A, 1B), realistic for Algerian schools
export let groups = [
  { id: 1, name: "1A", level_id: 1, teacher_id: 1 }, // Year 1 Primary, Class A
  { id: 2, name: "1B", level_id: 1, teacher_id: 2 },
  { id: 3, name: "2A", level_id: 2, teacher_id: 3 },
  { id: 4, name: "2B", level_id: 2, teacher_id: 4 },
  { id: 5, name: "6A", level_id: 6, teacher_id: 5 }, // Year 1 Middle, Class A
  { id: 6, name: "6B", level_id: 6, teacher_id: 6 },
  { id: 7, name: "10A", level_id: 10, teacher_id: 7 }, // Year 1 Secondary, Class A
  { id: 8, name: "10B", level_id: 10, teacher_id: 8 },
  { id: 9, name: "12A", level_id: 12, teacher_id: null }, // Year 3 Secondary, no teacher
  { id: 10, name: "12B", level_id: 12, teacher_id: 9 },
];

// Students: 20 students across levels, with rich fields
export let students = [
  {
    id: "s1",
    first_name: "Amina",
    last_name: "Bouchama",
    email: "amina.bouchama@example.dz",
    level_id: null,
    group_id: null,
    parent_id: 1,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2018-03-15",
    national_id: "1234567890",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s2",
    first_name: "Youssef",
    last_name: "Khelifi",
    email: "youssef.khelifi@example.dz",
    level_id: 1,
    group_id: 2,
    parent_id: 2,
    is_approved: false,
    docs_url: null,
    is_active: true,
    date_of_birth: "2018-05-20",
    national_id: "1234567891",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s3",
    first_name: "Fatima",
    last_name: "Zeroual",
    email: "fatima.zeroual@example.dz",
    level_id: 2,
    group_id: 3,
    parent_id: 3,
    is_approved: true,
    docs_url: "/docs/fatima.pdf",
    is_active: true,
    date_of_birth: "2017-07-10",
    national_id: "1234567892",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s4",
    first_name: "Omar",
    last_name: "Haddad",
    email: "omar.haddad@example.dz",
    level_id: 2,
    group_id: 4,
    parent_id: 4,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2017-02-25",
    national_id: "1234567893",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s5",
    first_name: "Leila",
    last_name: "Mansouri",
    email: "leila.mansouri@example.dz",
    level_id: 6,
    group_id: 5,
    parent_id: 5,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2013-11-30",
    national_id: "1234567894",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s6",
    first_name: "Karim",
    last_name: "Benaissa",
    email: "karim.benaissa@example.dz",
    level_id: 6,
    group_id: 6,
    parent_id: 6,
    is_approved: false,
    docs_url: null,
    is_active: true,
    date_of_birth: "2013-09-12",
    national_id: "1234567895",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s7",
    first_name: "Sofia",
    last_name: "Djemai",
    email: "sofia.djemai@example.dz",
    level_id: 10,
    group_id: 7,
    parent_id: 7,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2009-04-05",
    national_id: "1234567896",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s8",
    first_name: "Ahmed",
    last_name: "Toumi",
    email: "ahmed.toumi@example.dz",
    level_id: 10,
    group_id: 8,
    parent_id: 8,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2009-06-18",
    national_id: "1234567897",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s9",
    first_name: "Nadia",
    last_name: "Saidi",
    email: "nadia.saidi@example.dz",
    level_id: 12,
    group_id: 9,
    parent_id: 9,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2007-01-22",
    national_id: "1234567898",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s10",
    first_name: "Rachid",
    last_name: "Belkacem",
    email: "rachid.belkacem@example.dz",
    level_id: 12,
    group_id: 10,
    parent_id: 10,
    is_approved: false,
    docs_url: null,
    is_active: true,
    date_of_birth: "2007-03-10",
    national_id: "1234567899",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  // Additional students for scale
  {
    id: "s11",
    first_name: "Zahra",
    last_name: "Lakhdari",
    email: "zahra.lakhdari@example.dz",
    level_id: 1,
    group_id: 1,
    parent_id: 11,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2018-08-01",
    national_id: "1234567900",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s12",
    first_name: "Ismail",
    last_name: "Cherif",
    email: "ismail.cherif@example.dz",
    level_id: 1,
    group_id: 2,
    parent_id: 12,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2018-04-14",
    national_id: "1234567901",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s13",
    first_name: "Hana",
    last_name: "Bouzidi",
    email: "hana.bouzidi@example.dz",
    level_id: 2,
    group_id: 3,
    parent_id: 13,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2017-12-09",
    national_id: "1234567902",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s14",
    first_name: "Salim",
    last_name: "Guerfi",
    email: "salim.guerfi@example.dz",
    level_id: 6,
    group_id: 5,
    parent_id: 14,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2013-07-23",
    national_id: "1234567903",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s15",
    first_name: "Amel",
    last_name: "Hamidi",
    email: "amel.hamidi@example.dz",
    level_id: 10,
    group_id: 7,
    parent_id: 15,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2009-10-11",
    national_id: "1234567904",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s16",
    first_name: "Tarek",
    last_name: "Meziane",
    email: "tarek.meziane@example.dz",
    level_id: 12,
    group_id: 10,
    parent_id: 16,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2007-05-29",
    national_id: "1234567905",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s17",
    first_name: "Lina",
    last_name: "Ait-Salem",
    email: "lina.aitsalem@example.dz",
    level_id: 1,
    group_id: 1,
    parent_id: 17,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2018-06-03",
    national_id: "1234567906",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s18",
    first_name: "Bilal",
    last_name: "Rezzoug",
    email: "bilal.rezzoug@example.dz",
    level_id: 6,
    group_id: 6,
    parent_id: 18,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2013-02-17",
    national_id: "1234567907",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s19",
    first_name: "Meriem",
    last_name: "Boudiaf",
    email: "meriem.boudiaf@example.dz",
    level_id: 10,
    group_id: 8,
    parent_id: 19,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2009-08-04",
    national_id: "1234567908",
    gender: "F",
    enrollment_date: "2024-09-01",
  },
  {
    id: "s20",
    first_name: "Khalid",
    last_name: "Larbi",
    email: "khalid.larbi@example.dz",
    level_id: 12,
    group_id: 9,
    parent_id: 20,
    is_approved: true,
    docs_url: null,
    is_active: true,
    date_of_birth: "2007-11-15",
    national_id: "1234567909",
    gender: "M",
    enrollment_date: "2024-09-01",
  },
];

// Teachers: 10 teachers with subjects relevant to Algerian curriculum
export let teachers = [
  {
    id: 1,
    first_name: "Nour",
    last_name: "Benali",
    email: "nour.benali@example.dz",
    phone_number: "+213550123456",
    address: "12 Rue Didouche, Algiers",
    profile_picture: "/images/teacher1.png",
    module_key: "AR101",
    subject: "Arabic",
    qualification: "Master’s in Education",
    hire_date: "2015-09-01",
  },
  {
    id: 2,
    first_name: "Hassan",
    last_name: "Mokrani",
    email: "hassan.mokrani@example.dz",
    phone_number: "+213550123457",
    address: "45 Avenue Souidani, Oran",
    profile_picture: "/images/teacher2.png",
    module_key: "MATH101",
    subject: "Mathematics",
    qualification: "Bachelor’s in Mathematics",
    hire_date: "2018-09-01",
  },
  {
    id: 3,
    first_name: "Samia",
    last_name: "Berrada",
    email: "samia.berrada@example.dz",
    phone_number: "+213550123458",
    address: "78 Boulevard Krim, Constantine",
    profile_picture: "/images/teacher3.png",
    module_key: "FR101",
    subject: "French",
    qualification: "Master’s in French Literature",
    hire_date: "2016-09-01",
  },
  {
    id: 4,
    first_name: "Kamel",
    last_name: "Djebbar",
    email: "kamel.djebbar@example.dz",
    phone_number: "+213550123459",
    address: "23 Rue Larbi, Annaba",
    profile_picture: "/images/teacher4.png",
    module_key: "SCI101",
    subject: "Science",
    qualification: "PhD in Physics",
    hire_date: "2014-09-01",
  },
  {
    id: 5,
    first_name: "Rania",
    last_name: "Lounes",
    email: "rania.lounes@example.dz",
    phone_number: "+213550123460",
    address: "56 Avenue Pasteur, Algiers",
    profile_picture: "/images/teacher5.png",
    module_key: "HIST101",
    subject: "History",
    qualification: "Master’s in History",
    hire_date: "2017-09-01",
  },
  {
    id: 6,
    first_name: "Fares",
    last_name: "Zitouni",
    email: "fares.zitouni@example.dz",
    phone_number: "+213550123461",
    address: "89 Rue Emir, Blida",
    profile_picture: "/images/teacher6.png",
    module_key: "GEO101",
    subject: "Geography",
    qualification: "Bachelor’s in Geography",
    hire_date: "2019-09-01",
  },
  {
    id: 7,
    first_name: "Lamia",
    last_name: "Hadjali",
    email: "lamia.hadjali@example.dz",
    phone_number: "+213550123462",
    address: "34 Boulevard Zerktouni, Tlemcen",
    profile_picture: "/images/teacher7.png",
    module_key: "ENG101",
    subject: "English",
    qualification: "Master’s in English",
    hire_date: "2020-09-01",
  },
  {
    id: 8,
    first_name: "Tahar",
    last_name: "Boudjemaa",
    email: "tahar.boudjemaa@example.dz",
    phone_number: "+213550123463",
    address: "67 Rue Ben M’hidi, Sétif",
    profile_picture: "/images/teacher8.png",
    module_key: "PHY101",
    subject: "Physics",
    qualification: "PhD in Physics",
    hire_date: "2015-09-01",
  },
  {
    id: 9,
    first_name: "Imane",
    last_name: "Ghezali",
    email: "imane.ghezali@example.dz",
    phone_number: "+213550123464",
    address: "101 Avenue des Martyrs, Bejaia",
    profile_picture: "/images/teacher9.png",
    module_key: "CHEM101",
    subject: "Chemistry",
    qualification: "Master’s in Chemistry",
    hire_date: "2018-09-01",
  },
  {
    id: 10,
    first_name: "Djamel",
    last_name: "Aissani",
    email: "djamel.aissani@example.dz",
    phone_number: "+213550123465",
    address: "22 Rue de la Liberté, Batna",
    profile_picture: "/images/teacher10.png",
    module_key: "BIO101",
    subject: "Biology",
    qualification: "Master’s in Biology",
    hire_date: "2016-09-01",
  },
];

// Parents: 20 parents, linked to students
export let parents = [
  {
    id: 1,
    first_name: "Houria",
    last_name: "Bouchama",
    email: "houria.bouchama@example.dz",
    is_email_verified: true,
    phone_number: "+213660123401",
    is_phone_verified: true,
    address: "12 Rue Didouche, Algiers",
    profile_picture: "/images/parent1.png",
    fees_id: 1,
    occupation: "Teacher",
    national_id: "9876543210",
  },
  {
    id: 2,
    first_name: "Mourad",
    last_name: "Khelifi",
    email: "mourad.khelifi@example.dz",
    is_email_verified: false,
    phone_number: "+213660123402",
    is_phone_verified: false,
    address: "45 Avenue Souidani, Oran",
    profile_picture: "/images/default_profile.png",
    fees_id: null,
    occupation: "Engineer",
    national_id: "9876543211",
  },
  {
    id: 3,
    first_name: "Aicha",
    last_name: "Zeroual",
    email: "aicha.zeroual@example.dz",
    is_email_verified: true,
    phone_number: "+213660123403",
    is_phone_verified: true,
    address: "78 Boulevard Krim, Constantine",
    profile_picture: "/images/parent3.png",
    fees_id: 2,
    occupation: "Nurse",
    national_id: "9876543212",
  },
  {
    id: 4,
    first_name: "Abdelkader",
    last_name: "Haddad",
    email: "abdelkader.haddad@example.dz",
    is_email_verified: true,
    phone_number: "+213660123404",
    is_phone_verified: true,
    address: "23 Rue Larbi, Annaba",
    profile_picture: "/images/parent4.png",
    fees_id: 3,
    occupation: "Merchant",
    national_id: "9876543213",
  },
  {
    id: 5,
    first_name: "Naima",
    last_name: "Mansouri",
    email: "naima.mansouri@example.dz",
    is_email_verified: true,
    phone_number: "+213660123405",
    is_phone_verified: true,
    address: "56 Avenue Pasteur, Algiers",
    profile_picture: "/images/parent5.png",
    fees_id: 4,
    occupation: "Accountant",
    national_id: "9876543214",
  },
  {
    id: 6,
    first_name: "Reda",
    last_name: "Benaissa",
    email: "reda.benaissa@example.dz",
    is_email_verified: false,
    phone_number: "+213660123406",
    is_phone_verified: false,
    address: "89 Rue Emir, Blida",
    profile_picture: "/images/default_profile.png",
    fees_id: null,
    occupation: "Driver",
    national_id: "9876543215",
  },
  {
    id: 7,
    first_name: "Zohra",
    last_name: "Djemai",
    email: "zohra.djemai@example.dz",
    is_email_verified: true,
    phone_number: "+213660123407",
    is_phone_verified: true,
    address: "34 Boulevard Zerktouni, Tlemcen",
    profile_picture: "/images/parent7.png",
    fees_id: 5,
    occupation: "Librarian",
    national_id: "9876543216",
  },
  {
    id: 8,
    first_name: "Lakhdar",
    last_name: "Toumi",
    email: "lakhdar.toumi@example.dz",
    is_email_verified: true,
    phone_number: "+213660123408",
    is_phone_verified: true,
    address: "67 Rue Ben M’hidi, Sétif",
    profile_picture: "/images/parent8.png",
    fees_id: 6,
    occupation: "Lawyer",
    national_id: "9876543217",
  },
  {
    id: 9,
    first_name: "Malika",
    last_name: "Saidi",
    email: "malika.saidi@example.dz",
    is_email_verified: true,
    phone_number: "+213660123409",
    is_phone_verified: true,
    address: "101 Avenue des Martyrs, Bejaia",
    profile_picture: "/images/parent9.png",
    fees_id: 7,
    occupation: "Doctor",
    national_id: "9876543218",
  },
  {
    id: 10,
    first_name: "Said",
    last_name: "Belkacem",
    email: "said.belkacem@example.dz",
    is_email_verified: false,
    phone_number: "+213660123410",
    is_phone_verified: false,
    address: "22 Rue de la Liberté, Batna",
    profile_picture: "/images/default_profile.png",
    fees_id: null,
    occupation: "Mechanic",
    national_id: "9876543219",
  },
  {
    id: 11,
    first_name: "Khadidja",
    last_name: "Lakhdari",
    email: "khadidja.lakhdari@example.dz",
    is_email_verified: true,
    phone_number: "+213660123411",
    is_phone_verified: true,
    address: "15 Rue Frères, Algiers",
    profile_picture: "/images/parent11.png",
    fees_id: 8,
    occupation: "Clerk",
    national_id: "9876543220",
  },
  {
    id: 12,
    first_name: "Mustafa",
    last_name: "Cherif",
    email: "mustafa.cherif@example.dz",
    is_email_verified: true,
    phone_number: "+213660123412",
    is_phone_verified: true,
    address: "27 Avenue Ali, Oran",
    profile_picture: "/images/parent12.png",
    fees_id: 9,
    occupation: "Pharmacist",
    national_id: "9876543221",
  },
  {
    id: 13,
    first_name: "Sabrina",
    last_name: "Bouzidi",
    email: "sabrina.bouzidi@example.dz",
    is_email_verified: true,
    phone_number: "+213660123413",
    is_phone_verified: true,
    address: "33 Boulevard Amir, Constantine",
    profile_picture: "/images/parent13.png",
    fees_id: 10,
    occupation: "Teacher",
    national_id: "9876543222",
  },
  {
    id: 14,
    first_name: "Yacine",
    last_name: "Guerfi",
    email: "yacine.guerfi@example.dz",
    is_email_verified: true,
    phone_number: "+213660123414",
    is_phone_verified: true,
    address: "48 Rue des Écoles, Annaba",
    profile_picture: "/images/parent14.png",
    fees_id: 11,
    occupation: "Engineer",
    national_id: "9876543223",
  },
  {
    id: 15,
    first_name: "Farida",
    last_name: "Hamidi",
    email: "farida.hamidi@example.dz",
    is_email_verified: true,
    phone_number: "+213660123415",
    is_phone_verified: true,
    address: "62 Avenue des Frères, Algiers",
    profile_picture: "/images/parent15.png",
    fees_id: 12,
    occupation: "Nurse",
    national_id: "9876543224",
  },
  {
    id: 16,
    first_name: "Hocine",
    last_name: "Meziane",
    email: "hocine.meziane@example.dz",
    is_email_verified: true,
    phone_number: "+213660123416",
    is_phone_verified: true,
    address: "19 Rue de l’Indépendance, Blida",
    profile_picture: "/images/parent16.png",
    fees_id: 13,
    occupation: "Merchant",
    national_id: "9876543225",
  },
  {
    id: 17,
    first_name: "Djamila",
    last_name: "Ait-Salem",
    email: "djamila.aitsalem@example.dz",
    is_email_verified: true,
    phone_number: "+213660123417",
    is_phone_verified: true,
    address: "77 Boulevard Khemisti, Tlemcen",
    profile_picture: "/images/parent17.png",
    fees_id: 14,
    occupation: "Accountant",
    national_id: "9876543226",
  },
  {
    id: 18,
    first_name: "Rachid",
    last_name: "Rezzoug",
    email: "rachid.rezzoug@example.dz",
    is_email_verified: true,
    phone_number: "+213660123418",
    is_phone_verified: true,
    address: "88 Rue de la République, Sétif",
    profile_picture: "/images/parent18.png",
    fees_id: 15,
    occupation: "Driver",
    national_id: "9876543227",
  },
  {
    id: 19,
    first_name: "Asma",
    last_name: "Boudiaf",
    email: "asma.boudiaf@example.dz",
    is_email_verified: true,
    phone_number: "+213660123419",
    is_phone_verified: true,
    address: "99 Avenue de la Liberté, Bejaia",
    profile_picture: "/images/parent19.png",
    fees_id: 16,
    occupation: "Librarian",
    national_id: "9876543228",
  },
  {
    id: 20,
    first_name: "Mahmoud",
    last_name: "Larbi",
    email: "mahmoud.larbi@example.dz",
    is_email_verified: true,
    phone_number: "+213660123420",
    is_phone_verified: true,
    address: "44 Rue des Martyrs, Batna",
    profile_picture: "/images/parent20.png",
    fees_id: 17,
    occupation: "Lawyer",
    national_id: "9876543229",
  },
];

// Admins: 3 admins with roles
let admins = [
  {
    id: 1,
    first_name: "Mohamed",
    last_name: "Boukheddimi",
    email: "mohamed.boukheddimi@example.dz",
    phone_number: "+213770123401",
    is_super_admin: true,
    role: "School Director",
    department: "Administration",
  },
  {
    id: 2,
    first_name: "Fatima",
    last_name: "Guermouche",
    email: "fatima.guermouche@example.dz",
    phone_number: "+213770123402",
    is_super_admin: false,
    role: "Registrar",
    department: "Student Affairs",
  },
  {
    id: 3,
    first_name: "Abdelaziz",
    last_name: "Tounsi",
    email: "abdelaziz.tounsi@example.dz",
    phone_number: "+213770123403",
    is_super_admin: false,
    role: "IT Manager",
    department: "Technology",
  },
];

export let schedules = [
  {
    id: "1",
    group_id: 1,
    teacher_id: 1,
    subject: "رياضيات",
    day: "الإثنين",
    time: "08:00",
  },
  {
    id: "2",
    group_id: 1,
    teacher_id: 2,
    subject: "علوم",
    day: "الثلاثاء",
    time: "09:00",
  },
];

// Return level object by ID
export function getLevelById(id) {
  return levels.find(l => l.id === id);
}

// Return group object by ID
export function getGroupById(id) {
  return groups.find(g => g.id === id);
}

// Get all groups for a given level_id
export function getGroupsByLevelId(level_id) {
  return groups.filter(g => g.level_id === level_id);
}

// Sessions with groupId as key
export let sessions = [
  {
    id: "sess-1",
    subject: "رياضيات",
    teacher: "أ. بلال",
    room: "101",
    groupId: 1, // 1A
    day: "الأحد",
    time: "08:00"
  },
  {
    id: "sess-2",
    subject: "علوم",
    teacher: "أ. فاطمة",
    room: "102",
    groupId: 5, // 6A
    day: "الإثنين",
    time: "09:00"
  }
];



// Get sessions for a specific group (e.g., 1A)
export function getSessionsForGroup(groupId) {
  return sessions.filter(s => s.groupId === groupId);
}

// Add session
export function addSession(newSession) {
  sessions.push(newSession);
}

// Export functions
export function getStudents() {
  return students;
}

export function getGroups() {
  return groups;
}

export function getLevels() {
  return levels;
}

export function getParents() {
  return parents;
}

export function getTeachers() {
  return teachers;
}

export function getAdmins() {
  return admins;
}

export function updateStudent(id, updates) {
  students = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
}

export function updateParent(id, updates) {
  parents = parents.map((p) => (p.id === id ? { ...p, ...updates } : p));
}

export function updateTeacher(id, updates) {
  teachers = teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
}

export function updateAdmin(id, updates) {
  admins = admins.map((a) => (a.id === id ? { ...a, ...updates } : a));
}

export function addGroup(group) {
  const id = Math.max(...groups.map((g) => g.id), 0) + 1;
  groups.push({ id, ...group });
}

export function deleteStudent(id) {
  students = students.map((s) =>
    s.id === id ? { ...s, is_active: false } : s
  );
}

export function addStudent(student) {
  students.push(student);
}

export function getParentStudents(parent_id) {
  return students.filter((s) => s.parent_id === parent_id);
}

export function getGrades(){
  return grades;
}