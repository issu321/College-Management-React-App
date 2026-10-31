export const initialData = {
  superAdmin: {
    username: "usman",
    password: "Wsxcfty@9009",
    name: "Usman Root Admin",
    email: "usman@apexuniv.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    badge: "Super Admin (Root)"
  },

  colleges: [
    {
      id: "COL-101",
      name: "Apex National Institute of Technology & Management",
      code: "ANITM",
      affiliation: "Autonomous • Affiliated with State Technological University",
      accreditation: "NAAC A++ (Score 3.84/4.0) • NBA Accredited",
      established: 2008,
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      address: "Survey 42/1, Electronic City Phase 1, Hosur Main Road",
      postalCode: "560100",
      campusType: "Urban Tech Campus (35 Acres)",
      website: "https://anitm.edu.in",
      email: "admissions@anitm.edu.in",
      phone: "+91 80 2852 0100",
      departments: [
        "Computer Science & Engineering",
        "Artificial Intelligence & Data Science",
        "Information Technology",
        "Electronics & Communication Engineering",
        "Mechanical Engineering"
      ],
      logo: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=150&q=80",
      bannerColor: "from-sky-500 to-blue-600",
      status: "Active",
      createdAt: "2026-01-01"
    },
    {
      id: "COL-102",
      name: "St. Xavier Imperial College of Engineering",
      code: "SXICE",
      affiliation: "Affiliated with National Central University",
      accreditation: "NAAC A+ Accredited • NIRF Top 50 Ranked",
      established: 2012,
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      address: "Bandra-Kurla Academic Park, Bandra East",
      postalCode: "400051",
      campusType: "Metropolitan Research Campus (20 Acres)",
      website: "https://sxice.edu.in",
      email: "registrar@sxice.edu.in",
      phone: "+91 22 2650 9900",
      departments: [
        "Computer Science & Engineering",
        "Electronics & Communication Engineering",
        "Biotechnology & Bioinformatics",
        "Business Administration & Management"
      ],
      logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=150&q=80",
      bannerColor: "from-blue-600 to-indigo-700",
      status: "Active",
      createdAt: "2026-01-15"
    }
  ],

  teachers: [
    {
      id: "TEA-01",
      name: "Dr. Rajesh Sharma",
      email: "dr.sharma@apexuniv.edu",
      password: "Teacher@123",
      role: "teacher",
      collegeId: "COL-101",
      collegeName: "Apex National Institute of Technology & Management",
      department: "Computer Science & Engineering",
      designation: "Professor & Head of Department",
      qualification: "Ph.D. in Computer Science (IIT Bombay)",
      experience: "16 Years",
      specialization: "Distributed Systems & Cloud Computing",
      employeeId: "EMP-CSE-101",
      phone: "+91 98450 11223",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      status: "Active",
      createdAt: "2026-01-10"
    },
    {
      id: "TEA-02",
      name: "Prof. Ananya Sen",
      email: "ananya.sen@apexuniv.edu",
      password: "Teacher@123",
      role: "teacher",
      collegeId: "COL-101",
      collegeName: "Apex National Institute of Technology & Management",
      department: "Computer Science & Engineering",
      designation: "Associate Professor",
      qualification: "M.Tech in AI (IISc Bangalore)",
      experience: "9 Years",
      specialization: "Deep Learning & Natural Language Processing",
      employeeId: "EMP-CSE-108",
      phone: "+91 98800 44556",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      status: "Active",
      createdAt: "2026-01-12"
    }
  ],

  students: [
    {
      id: "STU-01",
      name: "Aarav Patel",
      email: "aarav.patel@student.apexuniv.edu",
      password: "Student@123",
      role: "student",
      collegeId: "COL-101",
      collegeName: "Apex National Institute of Technology & Management",
      department: "Computer Science & Engineering",
      rollNo: "CS26-001",
      year: "3rd Year",
      semester: "6th Sem",
      phone: "+91 97410 88990",
      guardian: "Suresh Patel (Father)",
      bloodGroup: "B+",
      address: "Hostel Block B, Room 304, Campus Grounds",
      attendance: 94,
      gpa: 3.92,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
      feeStatus: "Paid",
      totalFees: 4800,
      paidFees: 4800,
      status: "Active",
      createdAt: "2026-01-05"
    },
    {
      id: "STU-02",
      name: "Diya Mukherjee",
      email: "diya.m@student.apexuniv.edu",
      password: "Student@123",
      role: "student",
      collegeId: "COL-101",
      collegeName: "Apex National Institute of Technology & Management",
      department: "Computer Science & Engineering",
      rollNo: "CS26-014",
      year: "3rd Year",
      semester: "6th Sem",
      phone: "+91 98120 77665",
      guardian: "Mitali Mukherjee (Mother)",
      bloodGroup: "O+",
      address: "Flat 402, Green Meadows Residency, Electronic City",
      attendance: 88,
      gpa: 3.85,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      feeStatus: "Paid",
      totalFees: 4800,
      paidFees: 4800,
      status: "Active",
      createdAt: "2026-01-08"
    },
    {
      id: "STU-03",
      name: "Rohan Verma",
      email: "rohan.v@student.apexuniv.edu",
      password: "Student@123",
      role: "student",
      collegeId: "COL-101",
      collegeName: "Apex National Institute of Technology & Management",
      department: "Computer Science & Engineering",
      rollNo: "CS26-039",
      year: "3rd Year",
      semester: "6th Sem",
      phone: "+91 99011 22334",
      guardian: "Vikram Verma (Father)",
      bloodGroup: "A+",
      address: "Room 112, Boys Hostel A, Campus Grounds",
      attendance: 72,
      gpa: 3.25,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      feeStatus: "Pending",
      totalFees: 4800,
      paidFees: 2400,
      status: "Active",
      createdAt: "2026-01-08"
    }
  ],

  subjects: [
    {
      id: "SUB-01",
      collegeId: "COL-101",
      code: "CS601",
      title: "Cloud Architecture & Distributed Systems",
      department: "Computer Science & Engineering",
      teacherId: "TEA-01",
      teacherName: "Dr. Rajesh Sharma",
      credits: 4,
      semester: "6th Sem",
      room: "Tech Hall 301",
      syllabus: [
        "Module 1: Distributed System Fundamentals & CAP Theorem",
        "Module 2: Microservices & Event-Driven Architecture",
        "Module 3: Serverless Computing & Container Orchestration",
        "Module 4: Consensus Algorithms: Paxos and Raft",
        "Module 5: Global Multi-Tenant System Security"
      ],
      createdAt: "2026-01-10"
    },
    {
      id: "SUB-02",
      collegeId: "COL-101",
      code: "CS602",
      title: "Neural Networks & Deep Learning Foundations",
      department: "Computer Science & Engineering",
      teacherId: "TEA-02",
      teacherName: "Prof. Ananya Sen",
      credits: 4,
      semester: "6th Sem",
      room: "Computing Lab 4",
      syllabus: [
        "Module 1: Backpropagation & Loss Functions",
        "Module 2: Convolutional Neural Networks for Vision",
        "Module 3: Recurrent Networks & Sequence Modeling",
        "Module 4: Transformers & Multi-Head Self-Attention",
        "Module 5: Generative Adversarial Networks & Diffusion Models"
      ],
      createdAt: "2026-01-12"
    }
  ],

  notes: [
    {
      id: "NOTE-01",
      collegeId: "COL-101",
      subjectId: "SUB-01",
      subjectCode: "CS601",
      subjectTitle: "Cloud Architecture & Distributed Systems",
      teacherId: "TEA-01",
      teacherName: "Dr. Rajesh Sharma",
      title: "Unit 1: CAP Theorem & Consistency Models",
      description: "Complete analytical notes on strong consistency, eventual consistency, Brewer's conjecture, and PACELC trade-offs.",
      category: "Lecture Slides & Theory Notes",
      fileName: "CS601_Unit1_CAP_Theorem.pdf",
      fileType: "application/pdf",
      fileSize: "2.4 MB",
      fileData: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iaiA8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iaiA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqIDw8L0xlbmd0aCA2OT4+CnN0cmVhbQpCVAovRjEgMTggVGYKNTAgNzAwIFRECltBUEVYIENNUzogQ2xvdWQgQXJjaGl0ZWN0dXJlICYgRGlzdHJpYnV0ZWQgU3lzdGVtc10gVEoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDEgMDAwMDAgbiAKdHJhaWxlciA8PC9TaXplIDUvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyOTUKJSVFT0YK",
      uploadedAt: "2026-02-05"
    },
    {
      id: "NOTE-02",
      collegeId: "COL-101",
      subjectId: "SUB-02",
      subjectCode: "CS602",
      subjectTitle: "Neural Networks & Deep Learning Foundations",
      teacherId: "TEA-02",
      teacherName: "Prof. Ananya Sen",
      title: "Attention Is All You Need: Transformer Architecture",
      description: "Mathematical formulation of scaled dot-product attention, positional encodings, and residual layer normalization.",
      category: "Research Notes & Slide Deck",
      fileName: "CS602_Transformers_Architecture.pdf",
      fileType: "application/pdf",
      fileSize: "3.1 MB",
      fileData: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iaiA8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iaiA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqIDw8L0xlbmd0aCA2OT4+CnN0cmVhbQpCVAovRjEgMTggVGYKNTAgNzAwIFRECltBUEVYIENNUzogVHJhbnNmb3JtZXIgQXJjaGl0ZWN0dXJlICYgQXR0ZW50aW9uXSBUSgpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIwMSAwMDAwMCBuIAp0cmFpbGVyIDw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI5NQolJUVPRgo=",
      uploadedAt: "2026-02-12"
    }
  ],

  assignments: [
    {
      id: "ASN-01",
      collegeId: "COL-101",
      subjectId: "SUB-01",
      subjectCode: "CS601",
      subjectTitle: "Cloud Architecture & Distributed Systems",
      teacherId: "TEA-01",
      teacherName: "Dr. Rajesh Sharma",
      title: "Lab Assignment 3: Raft Consensus Implementation in Node/Go",
      description: "Build an active 3-node cluster leader election mechanism with randomized heartbeat timeouts and vote requests.",
      dueDate: "2026-03-25",
      maxMarks: 100,
      attachmentName: "Raft_Assignment_Spec.pdf",
      attachmentData: "",
      createdAt: "2026-02-15",
      submissions: [
        {
          id: "SUBM-01",
          studentId: "STU-01",
          studentName: "Aarav Patel",
          rollNo: "CS26-001",
          submittedAt: "2026-02-20 16:45",
          notes: "Cluster leader election passed with 100% split-vote recovery and log replication tests.",
          fileName: "Aarav_Raft_Cluster_Solution.zip",
          fileData: "",
          grade: 98,
          feedback: "Flawless term election handling and heartbeat management. Commendable work!",
          status: "Graded"
        }
      ]
    }
  ],

  attendanceRecords: [
    {
      id: "ATT-01",
      collegeId: "COL-101",
      subjectId: "SUB-01",
      subjectCode: "CS601",
      subjectTitle: "Cloud Architecture & Distributed Systems",
      teacherId: "TEA-01",
      date: "2026-02-20",
      records: [
        { studentId: "STU-01", studentName: "Aarav Patel", rollNo: "CS26-001", status: "Present" },
        { studentId: "STU-02", studentName: "Diya Mukherjee", rollNo: "CS26-014", status: "Present" },
        { studentId: "STU-03", studentName: "Rohan Verma", rollNo: "CS26-039", status: "Absent" }
      ]
    }
  ],

  fees: [
    {
      id: "INV-2026-001",
      collegeId: "COL-101",
      studentId: "STU-01",
      studentName: "Aarav Patel",
      rollNo: "CS26-001",
      department: "Computer Science & Engineering",
      title: "Spring 2026 Semester Tuition & Lab Maintenance Fee",
      amount: 4800,
      paidAmount: 4800,
      status: "Paid",
      dueDate: "2026-01-31",
      paymentDate: "2026-01-20",
      paymentMethod: "UPI / Net Banking",
      transactionId: "TXN-88493021",
      createdAt: "2026-01-05"
    },
    {
      id: "INV-2026-002",
      collegeId: "COL-101",
      studentId: "STU-02",
      studentName: "Diya Mukherjee",
      rollNo: "CS26-014",
      department: "Computer Science & Engineering",
      title: "Spring 2026 Semester Tuition & Lab Maintenance Fee",
      amount: 4800,
      paidAmount: 4800,
      status: "Paid",
      dueDate: "2026-01-31",
      paymentDate: "2026-01-22",
      paymentMethod: "Credit Card (Visa)",
      transactionId: "TXN-99482103",
      createdAt: "2026-01-05"
    },
    {
      id: "INV-2026-003",
      collegeId: "COL-101",
      studentId: "STU-03",
      studentName: "Rohan Verma",
      rollNo: "CS26-039",
      department: "Computer Science & Engineering",
      title: "Spring 2026 Semester Tuition & Lab Maintenance Fee",
      amount: 4800,
      paidAmount: 2400,
      status: "Unpaid",
      dueDate: "2026-03-31",
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
      createdAt: "2026-01-05"
    }
  ],

  notices: [
    {
      id: "NOT-01",
      collegeId: "COL-101",
      title: "Mid-Term Examination Datesheet Announced for 6th Semester",
      category: "Examination",
      priority: "High",
      target: "All Students & Faculty",
      content: "The mid-term assessments for all branches will commence from March 16, 2026. Hall tickets and seating matrices are published on the institutional intranet.",
      date: "2026-02-18",
      author: "Office of the Controller of Examinations"
    },
    {
      id: "NOT-02",
      collegeId: "COL-101",
      title: "Global Tech Symposium & Hackathon Registrations Open",
      category: "Academic & Cultural",
      priority: "Normal",
      target: "All Students",
      content: "Students from all academic years are invited to participate in the 48-Hour National AI & Cloud Hackathon scheduled for April 2-4, 2026.",
      date: "2026-02-21",
      author: "Department of Student Affairs"
    }
  ]
};
