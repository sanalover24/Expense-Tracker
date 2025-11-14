
import { User, Category, Transaction } from './types';

export const dummyUser: User = {
  id: 1,
  name: "Nihath",
  email: "nihath@mail.com"
};

export const dummyCategories: Category[] = [
  {id: '1', "name": "Salary", "type": "income"},
  {id: '2', "name": "Freelance", "type": "income"},
  {id: '3', "name": "Gifts", "type": "income"},
  {id: '4', "name": "Food", "type": "expense"},
  {id: '5', "name": "Rent", "type": "expense"},
  {id: '6', "name": "Transport", "type": "expense"},
  {id: '7', "name": "Shopping", "type": "expense"},
  {id: '8', "name": "Utilities", "type": "expense"},
  {id: '9', "name": "Entertainment", "type": "expense"}
];

export const dummyTransactions: Transaction[] = [
    {"id": '1', "type": "income", "category": "Salary", "amount": 50000, "date": new Date('2025-11-01T09:00:00').toISOString(), "note": "Monthly salary"},
    {"id": '2', "type": "expense", "category": "Rent", "amount": 18000, "date": new Date('2025-11-03T18:30:00').toISOString(), "note": "House rent"},
    {"id": '3', "type": "expense", "category": "Shopping", "amount": 2500, "date": new Date('2025-11-05T15:15:00').toISOString(), "note": "New shoes"},
    {"id": '4', "type": "income", "category": "Freelance", "amount": 8000, "date": new Date('2025-11-06T11:00:00').toISOString(), "note": "Logo design"},
    {"id": '5', "type": "expense", "category": "Food", "amount": 1200, "date": new Date('2025-11-02T13:00:00').toISOString(), "note": "Lunch at cafe"},
    {"id": '6', "type": "expense", "category": "Transport", "amount": 500, "date": new Date('2025-11-08T08:45:00').toISOString(), "note": "Bus fare"},
    {"id": '7', "type": "expense", "category": "Food", "amount": 1500, "date": new Date('2025-11-10T20:00:00').toISOString(), "note": "Dinner with friends"},
    {"id": '8', "type": "expense", "category": "Entertainment", "amount": 800, "date": new Date('2025-11-12T19:30:00').toISOString(), "note": "Movie tickets"},
    {"id": '9', "type": "income", "category": "Gifts", "amount": 2000, "date": new Date('2025-11-15T12:00:00').toISOString(), "note": "Birthday gift"},
    {"id": '10', "type": "expense", "category": "Utilities", "amount": 3200, "date": new Date('2025-11-20T18:00:00').toISOString(), "note": "Electricity and Internet bill"}
];