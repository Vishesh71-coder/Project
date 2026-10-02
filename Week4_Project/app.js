"use strict";

const STORAGE_KEY = "campusdesk.students.v1";

function getElements() {
  return {
    addButton: document.querySelector("#add-student-button"),
    dialog: document.querySelector("#student-dialog"),
    form: document.querySelector("#student-form"),
    title: document.querySelector("#dialog-title"),
    id: document.querySelector("#student-id"),

    name: document.querySelector("#student-name"),
    email: document.querySelector("#student-email"),
    rollNumber: document.querySelector("#student-roll"),
    course: document.querySelector("#student-course"),
    courseSuggestions: document.querySelector("#course-suggestions"),
    date: document.querySelector("#student-date"),

    saveButton: document.querySelector("#save-student-button"),
    body: document.querySelector("#students-table-body"),
    search: document.querySelector("#search-input"),
    filter: document.querySelector("#course-filter"),

    total: document.querySelector("#total-students"),
    courses: document.querySelector("#total-courses"),
    latest: document.querySelector("#recent-enrollments"),
    count: document.querySelector("#record-count"),

    empty: document.querySelector("#empty-state"),
    formError: document.querySelector("#form-error"),
    clear: document.querySelector("#clear-filters-button"),
    overviewSection: document.querySelector("#overview-section"),
    studentsSection: document.querySelector("#students-section"),
    coursesSection: document.querySelector("#courses-section"),
    navOverview: document.querySelector("#nav-overview"),
    navStudents: document.querySelector("#nav-students"),
    navCourses: document.querySelector("#nav-courses"),
    coursesTableBody: document.querySelector("#courses-table-body"),
    coursesEmpty: document.querySelector("#courses-empty-state"),
    coursesCount: document.querySelector("#course-record-count"),
    activity: document.querySelector("#recent-activity-list"),
    toast: document.querySelector("#toast")
  };
}

const SEED_STUDENTS = [
  {
    id: "seed-1001",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    rollNumber: "CS2024001",
    course: "B.Tech CSE",
    enrollmentDate: "2024-08-12"
  },
  {
    id: "seed-1002",
    name: "Priya Verma",
    email: "priya.verma@example.com",
    rollNumber: "CS2024002",
    course: "B.Tech IT",
    enrollmentDate: "2024-08-14"
  },
  {
    id: "seed-1003",
    name: "Rohan Gupta",
    email: "rohan.gupta@example.com",
    rollNumber: "CS2024003",
    course: "BCA",
    enrollmentDate: "2024-08-19"
  },
  {
    id: "seed-1004",
    name: "Ananya Singh",
    email: "ananya.singh@example.com",
    rollNumber: "CS2024004",
    course: "B.Tech CSE",
    enrollmentDate: "2024-08-21"
  }
];

let toastTimer;
let students;
let elements;

document.addEventListener("DOMContentLoaded", () => {
  elements = getElements();
  students = loadStudents();
  initialize();
}, { once: true });

function initialize() {
  bindEvents();
  render();
}

function loadStudents() {
  let saved;

  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not read student records from localStorage:", error);
    showToast("Browser storage is unavailable. Changes may not be saved.");
    return [];
  }

  if (saved === null) {
    const initialStudents = [...SEED_STUDENTS];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents));
    } catch (error) {
      console.error("Could not save initial student records:", error);
      showToast("Browser storage is unavailable. Changes may not be saved.");
    }

    return initialStudents;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Saved student data is not an array.");
    }

    const validStudents = parsed.filter(isValidStudent);

    if (validStudents.length !== parsed.length) {
      showToast("Some invalid saved records were skipped.");
    }

    return validStudents;
  } catch (error) {
    console.error("Could not parse saved student records:", error);
    showToast("Saved records could not be read. Add a student to replace them.");
    return [];
  }
}

function isValidStudent(student) {
  return Boolean(
    student &&
    typeof student === "object" &&
    typeof student.id === "string" &&
    typeof student.name === "string" &&
    student.name.trim() &&
    typeof student.email === "string" &&
    typeof student.rollNumber === "string" &&
    typeof student.course === "string" &&
    typeof student.enrollmentDate === "string" &&
    parseDateOnly(student.enrollmentDate)
  );
}

function persistStudents(nextStudents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents));
    students = nextStudents;
    return true;
  } catch (error) {
    console.error("Could not save student records:", error);
    showToast("Unable to save student data. Check browser storage settings.");
    return false;
  }
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `student-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = parseDateOnly(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function createCell(content, className = "") {
  const cell = document.createElement("td");

  if (className) {
    cell.className = className;
  }

  cell.textContent = content;
  return cell;
}

function renderStats() {
  const uniqueCourses = new Set(
    students
      .map((student) => student.course.trim().toLocaleLowerCase())
      .filter(Boolean)
  );

  const latestDate = students
    .map((student) => student.enrollmentDate)
    .filter((date) => parseDateOnly(date))
    .sort((a, b) => b.localeCompare(a))[0];

  elements.total.textContent = String(students.length);
  elements.courses.textContent = String(uniqueCourses.size);
  elements.latest.textContent = latestDate ? formatDate(latestDate) : "—";

  renderRecentActivity();
  renderCourses();
}

function renderRecentActivity() {
  const recentStudents = [...students]
    .sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate))
    .slice(0, 5);
  const fragment = document.createDocumentFragment();

  if (recentStudents.length === 0) {
    const item = document.createElement("li");
    item.className = "activity-empty";
    item.textContent = "No enrollment activity yet.";
    fragment.append(item);
  } else {
    recentStudents.forEach((student) => {
      const item = document.createElement("li");
      item.className = "activity-item";

      const name = document.createElement("strong");
      name.textContent = student.name;

      const details = document.createElement("span");
      details.textContent = `${student.course} · ${formatDate(student.enrollmentDate)}`;

      item.append(name, details);
      fragment.append(item);
    });
  }

  elements.activity.replaceChildren(fragment);
}

function renderCourses() {
  const coursesByName = new Map();

  students.forEach((student) => {
    const name = student.course.trim();
    if (!name) return;

    const key = name.toLocaleLowerCase();
    const course = coursesByName.get(key) || { name, students: [] };
    course.students.push(student.name);
    coursesByName.set(key, course);
  });

  const courses = [...coursesByName.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const fragment = document.createDocumentFragment();

  courses.forEach((course) => {
    const row = document.createElement("tr");
    const nameCell = createCell("", "course-name-cell");
    const name = document.createElement("strong");
    name.textContent = course.name;
    nameCell.append(name);

    row.append(
      nameCell,
      createCell(String(course.students.length)),
      createCell(course.students.join(", "), "course-student-list")
    );
    fragment.append(row);
  });

  elements.coursesTableBody.replaceChildren(fragment);
  elements.coursesEmpty.hidden = courses.length !== 0;
  elements.coursesCount.textContent =
    `${courses.length} ${courses.length === 1 ? "course" : "courses"}`;
}

function renderCourseFilter() {
  const selected = elements.filter.value;

  const courses = [
    ...new Map(
      students
        .map((student) => student.course.trim())
        .filter(Boolean)
        .map((course) => [course.toLocaleLowerCase(), course])
    ).values()
  ].sort((a, b) => a.localeCompare(b));

  elements.filter.replaceChildren(new Option("All courses", ""));

  courses.forEach((course) => {
    elements.filter.add(new Option(course, course.toLocaleLowerCase()));
  });

  const suggestions = courses.map((course) => {
    const option = document.createElement("option");
    option.value = course;
    return option;
  });
  elements.courseSuggestions.replaceChildren(...suggestions);

  if (courses.some((course) => course.toLocaleLowerCase() === selected)) {
    elements.filter.value = selected;
  }
}

function getVisibleStudents() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const selectedCourse = elements.filter.value;

  return students
    .filter((student) => {
      const matchesSearch = [
        student.name,
        student.email,
        student.rollNumber
      ].some((value) => value.toLocaleLowerCase().includes(query));

      const matchesCourse =
        !selectedCourse ||
        student.course.trim().toLocaleLowerCase() === selectedCourse;

      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderStudents() {
  const visibleStudents = getVisibleStudents();
  const fragment = document.createDocumentFragment();

  visibleStudents.forEach((student) => {
    const row = document.createElement("tr");

    const studentCell = document.createElement("td");
    const profile = document.createElement("div");
    profile.className = "student-cell";

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = initials(student.name);
    avatar.setAttribute("aria-hidden", "true");

    const details = document.createElement("div");

    const name = document.createElement("div");
    name.className = "student-name";
    name.textContent = student.name;

    const email = document.createElement("div");
    email.className = "student-email";
    email.textContent = student.email;

    details.append(name, email);
    profile.append(avatar, details);
    studentCell.append(profile);

    const rollCell = createCell(student.rollNumber, "roll-number");

    const courseCell = document.createElement("td");
    const coursePill = document.createElement("span");
    coursePill.className = "course-pill";
    coursePill.textContent = student.course;
    courseCell.append(coursePill);

    const dateCell = createCell(formatDate(student.enrollmentDate));

    const actionsCell = document.createElement("td");
    const actionGroup = document.createElement("div");
    actionGroup.className = "row-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "row-action-button edit-action";
    editButton.dataset.action = "edit";
    editButton.dataset.id = student.id;
    editButton.textContent = "Edit";
    editButton.title = "Edit student";
    editButton.setAttribute("aria-label", `Edit ${student.name}`);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "row-action-button delete-action";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = student.id;
    deleteButton.textContent = "Delete";
    deleteButton.title = "Delete student";
    deleteButton.setAttribute("aria-label", `Delete ${student.name}`);

    actionGroup.append(editButton, deleteButton);
    actionsCell.append(actionGroup);

    row.append(studentCell, rollCell, courseCell, dateCell, actionsCell);
    fragment.append(row);
  });

  elements.body.replaceChildren(fragment);
  elements.empty.hidden = visibleStudents.length !== 0;

  elements.count.textContent =
    `${visibleStudents.length} ${visibleStudents.length === 1 ? "record" : "records"}`;

  renderStats();
}

function render() {
  renderCourseFilter();
  renderStudents();
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });

  elements.form?.querySelectorAll('input[aria-invalid="true"]')
    .forEach((input) => input.removeAttribute("aria-invalid"));

  const formStatus = document.querySelector("#formStatus");
  if (formStatus) {
    formStatus.textContent = "";
  }
  if (elements.formError) {
    elements.formError.textContent = "";
    elements.formError.hidden = true;
  }
}

function setError(input, errorId, message) {
  input.setAttribute("aria-invalid", "true");

  const fieldError = document.getElementById(errorId);
  if (fieldError) {
    fieldError.textContent = message;
  } else if (elements.formError) {
    elements.formError.textContent = message;
    elements.formError.hidden = false;
  }
}

function validateForm() {
  clearErrors();

  let valid = true;

  const name = elements.name.value.trim();
  const email = elements.email.value.trim();
  const roll = elements.rollNumber.value.trim();
  const course = elements.course.value.trim();
  const date = elements.date.value;
  const editingId = elements.id.value;

  if (name.length < 2) {
    setError(elements.name, "nameError", "Enter a name with at least 2 characters.");
    valid = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError(elements.email, "emailError", "Enter a valid email address.");
    valid = false;
  }

  if (!roll) {
    setError(elements.rollNumber, "rollError", "Roll number is required.");
    valid = false;
  }

  if (!course) {
    setError(elements.course, "courseError", "Course is required.");
    valid = false;
  }

  const parsedDate = parseDateOnly(date);

  if (!parsedDate) {
    setError(elements.date, "dateError", "Choose a valid enrollment date.");
    valid = false;
  } else if (date > localDateString()) {
    setError(elements.date, "dateError", "Enrollment date cannot be in the future.");
    valid = false;
  }

  const normalizedEmail = email.toLocaleLowerCase();
  const duplicateEmail = students.some((student) =>
    student.email.trim().toLocaleLowerCase() === normalizedEmail &&
    student.id !== editingId
  );

  if (email && duplicateEmail) {
    setError(elements.email, "emailError", "This email is already registered.");
    valid = false;
  }

  const normalizedRoll = roll.toLocaleLowerCase();
  const duplicateRoll = students.some((student) =>
    student.rollNumber.trim().toLocaleLowerCase() === normalizedRoll &&
    student.id !== editingId
  );

  if (roll && duplicateRoll) {
    setError(elements.rollNumber, "rollError", "This roll number is already registered.");
    valid = false;
  }

  return valid;
}

function openAddDialog() {
  elements.form.reset();
  elements.id.value = "";
  clearErrors();

  elements.title.textContent = "Add student";
  elements.saveButton.textContent = "Save student";
  elements.date.value = localDateString();

  elements.dialog.showModal();
  elements.name.focus();
}

function openEditDialog(id) {
  const student = students.find((item) => item.id === id);

  if (!student) {
    showToast("That student record could not be found.");
    return;
  }

  elements.form.reset();
  clearErrors();

  elements.id.value = student.id;
  elements.name.value = student.name;
  elements.email.value = student.email;
  elements.rollNumber.value = student.rollNumber;
  elements.course.value = student.course;
  elements.date.value = student.enrollmentDate;

  elements.title.textContent = "Edit student";
  elements.saveButton.textContent = "Save changes";

  elements.dialog.showModal();
  elements.name.focus();
}

function saveStudent(event) {
  event.preventDefault();

  if (!validateForm()) {
    elements.form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const id = elements.id.value;

  const record = {
    id: id || makeId(),
    name: elements.name.value.trim(),
    email: elements.email.value.trim(),
    rollNumber: elements.rollNumber.value.trim(),
    course: elements.course.value.trim(),
    enrollmentDate: elements.date.value
  };

  const nextStudents = id
    ? students.map((student) => student.id === id ? record : student)
    : [...students, record];

  if (!persistStudents(nextStudents)) {
    return;
  }

  elements.dialog.close();
  render();

  showToast(id ? "Student details updated." : "Student added successfully.");
}

function deleteStudent(id) {
  const student = students.find((item) => item.id === id);

  if (!student) {
    showToast("That student record could not be found.");
    return;
  }

  const confirmed = window.confirm(
    `Delete ${student.name}'s record? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  const nextStudents = students.filter((item) => item.id !== id);

  if (!persistStudents(nextStudents)) {
    return;
  }

  render();
  showToast("Student record deleted.");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  window.clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2800);
}

function bindEvents() {
  elements.navOverview?.addEventListener("click", (event) => {
    event.preventDefault();
    switchTab("overview");
  });
  elements.navStudents?.addEventListener("click", (event) => {
    event.preventDefault();
    switchTab("students");
  });
  elements.navCourses?.addEventListener("click", (event) => {
    event.preventDefault();
    switchTab("courses");
  });

  elements.addButton?.addEventListener("click", openAddDialog);
  elements.form?.addEventListener("submit", saveStudent);

  elements.search?.addEventListener("input", renderStudents);
  elements.filter?.addEventListener("change", renderStudents);

  elements.body?.addEventListener("click", (event) => {
    const button = event.target?.closest("button[data-action][data-id]");

    if (!button || !elements.body?.contains(button)) {
      return;
    }

    if (button.dataset.action === "edit") {
      openEditDialog(button.dataset.id);
    } else if (button.dataset.action === "delete") {
      deleteStudent(button.dataset.id);
    }
  });

  elements.clear?.addEventListener("click", () => {
    if (elements.search) elements.search.value = "";
    if (elements.filter) elements.filter.value = "";
    render();
    elements.search?.focus();
  });

  document.querySelectorAll("#close-dialog-button, #cancel-dialog-button").forEach((button) => {
    button.addEventListener("click", () => elements.dialog?.close());
  });

  elements.dialog?.addEventListener("click", (event) => {
    if (event.target === elements.dialog) {
      elements.dialog?.close();
    }
  });

  elements.dialog?.addEventListener("close", clearErrors);
}

function switchTab(tabName) {
  const tabs = [
    { name: "overview", section: elements.overviewSection, link: elements.navOverview },
    { name: "students", section: elements.studentsSection, link: elements.navStudents },
    { name: "courses", section: elements.coursesSection, link: elements.navCourses }
  ];

  tabs.forEach(({ name, section, link }) => {
    const active = tabName === name;
    if (section) section.hidden = !active;
    link?.classList.toggle("active", active);

    if (active) {
      link?.setAttribute("aria-current", "page");
    } else {
      link?.removeAttribute("aria-current");
    }
  });
}