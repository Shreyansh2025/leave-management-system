require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const { initDb, run, get } = require('./src/config/db');

async function seed() {
  await initDb();

  const password = await bcrypt.hash('Password123!', 10);

  const existingManager = get('SELECT id FROM employees WHERE email = ?', ['manager@company.com']);
  let managerId;

  if (!existingManager) {
    const result = run(
      `INSERT INTO employees (name, email, password, department, role) VALUES (?, ?, ?, ?, 'manager')`,
      ['Shruti Jat', 'manager@proteccio.com', password, 'Engineering']
    );
    managerId = result.lastInsertRowid;
    console.log('Created manager: manager@proteccio.com / Password123!');
  } else {
    managerId = existingManager.id;
    console.log('Manager already exists, skipping.');
  }

  const employees = [
    { name: 'Ajay Mehta', email: 'ajay@proteccio.com', dept: 'Engineering' },
    { name: 'Shreyansh Surana', email: 'shreyansh@proteccio.com', dept: 'Design' },
    { name: 'Priyani Patidar', email: 'priyani@proteccio.com', dept: 'Engineering' },
  ];

  const employeeIds = [];
  for (const emp of employees) {
    const existing = get('SELECT id FROM employees WHERE email = ?', [emp.email]);
    if (existing) {
      employeeIds.push(existing.id);
      continue;
    }
    const result = run(
      `INSERT INTO employees (name, email, password, department, role, manager_id) VALUES (?, ?, ?, ?, 'employee', ?)`,
      [emp.name, emp.email, password, emp.dept, managerId]
    );
    employeeIds.push(result.lastInsertRowid);
    console.log(`Created employee: ${emp.email} / Password123!`);
  }

  const existingLeaves = get('SELECT COUNT(*) AS count FROM leaves');
  if (existingLeaves.count === 0) {
    run(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeIds[0], 'Sick', '2026-07-10', '2026-07-11', 'Fever and rest advised by doctor', 'Pending']
    );
    run(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, manager_comments, reviewed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeIds[1], 'Casual', '2026-06-20', '2026-06-21', 'Family function', 'Approved', 'Approved, enjoy!', managerId]
    );
    run(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, manager_comments, reviewed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeIds[2], 'Unpaid', '2026-06-01', '2026-06-05', 'Personal travel', 'Rejected', 'Peak sprint week, please reschedule', managerId]
    );
    run(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeIds[0], 'Earned', '2026-08-01', '2026-08-03', 'Planned vacation', 'Pending']
    );
    console.log('Seeded sample leave requests.');
  } else {
    console.log('Leaves already exist, skipping.');
  }

  console.log('\nSeed complete. Sample logins:');
  console.log('  Manager  -> manager@proteccio.com / Password123!');
  console.log('  Employee -> ajay@proteccio.com   / Password123!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});