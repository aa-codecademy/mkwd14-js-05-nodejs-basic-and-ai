# Homework: Library Book Tracker API (MVC)

**Course:** Web API Development with Node.js & AI  
**Builds on:** [Class 06 – MVC Pattern](../class_06_mvc/), [Class 06 README](../class_06_mvc/README.md)

---

## Goal

Build a **Library Book Tracker API** using Express and the **MVC architectural pattern** as demonstrated in class. The API manages a library's **books** and **loans** (borrowing and returning books).

Use the class project as a reference for how to structure your code, which layers to create, and how they communicate.

---

## Domain Description

A small neighbourhood library wants a simple system to track their books and who borrows them.

### Books

The library keeps a catalogue of books. Each book has a **title**, **author**, **genre**, a **publication year**, and the **number of copies** the library owns. The library also tracks how many copies are currently **available** (not loaned out).

**Rules:**
- A librarian can **add** a new book to the catalogue. Title, author, and genre are always required. If the number of copies isn't specified, assume 1. All copies start as available.
- The same book (same title AND author, regardless of upper/lower case) cannot be added twice.
- A librarian can **remove** a book from the catalogue, but only if **all** copies are currently in the library (none are loaned out).
- Anyone can **view** the full catalogue or look up a specific book.

### Loans

When someone wants to borrow a book, the library creates a **loan** record. A loan tracks **which book** was borrowed, the **borrower's name**, **when** it was borrowed, and **when** it is due back (14 days from borrowing).

**Rules:**
- A book can only be borrowed if there is at least one **available** copy. Borrowing reduces the available count by 1.
- When a book is **returned**, the available count goes back up by 1.
- A loan has a **lifecycle** (state machine):
  - It starts as **active** when the book is borrowed.
  - It becomes **returned** when the borrower brings the book back.
  - A loan that is already returned cannot be returned again.
- When viewing loans, the API should include the **book's title** alongside the loan data (the title is not stored in the loan — it is looked up from the book).

### Loan State Machine

```
        Borrow a book
              │
              ▼
         ┌─────────┐
         │  ACTIVE  │ ──── Return the book ────→ ┌──────────┐
         └─────────┘                              │ RETURNED │
                                                  └──────────┘
```

---

## API

All routes should be under `/api`.

### Books

| Action | What it does | On success | On failure |
|--------|-------------|------------|------------|
| List all books | Returns every book in the catalogue | 200 | — |
| Get one book | Returns a single book by its ID | 200 | 404 if not found |
| Add a book | Creates a new book record | 201 | 400 if required fields missing, 409 if duplicate |
| Remove a book | Deletes a book from the catalogue | 200 | 404 if not found, 400 if copies are loaned out |

**Adding a book — required fields:** `title`, `author`, `genre`. Optional: `year`, `copies`.

### Loans

| Action | What it does | On success | On failure |
|--------|-------------|------------|------------|
| List all loans | Returns all loans with the book's title included | 200 | — |
| Get one loan | Returns a single loan with the book's title included | 200 | 404 if not found |
| Borrow a book | Creates a new loan | 201 | 400 if fields missing, 404 if book not found, 400 if no copies available |
| Return a book | Marks a loan as returned | 200 | 404 if loan not found, 400 if already returned |

**Borrowing a book — required fields:** `bookId`, `borrower` (name of the person).

---

## Bonus (optional)

1. **Overdue detection** — If a loan is still active but its due date has passed, automatically mark it as `"overdue"` when it is retrieved. Both active and overdue loans can be returned.

2. **Statistics endpoint** — An endpoint that returns aggregate data: total books, total loans, active loans count, the most borrowed book, and the top borrower.

3. **Filtering** — Allow filtering books by genre, by availability (only books with copies available), and by a search term that matches title or author.

---

## Deliverables

1. Working Express API following the MVC pattern from class.
2. Data persisted in JSON files.
3. `.gitignore` ignoring `node_modules/`.

Notify the trainer when the homework is ready by email to review.

---

Good luck!
