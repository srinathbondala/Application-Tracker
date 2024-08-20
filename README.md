# Account Management API

This Node.js application provides a RESTful API for managing accounts using Express.js and MySQL. The API allows users to perform CRUD operations on account data.

## Note

- During registration as admin select role as admin and enter AdminKey123 as SecretKey to register as Admin.
- Logout is present in profile  

## Features

- Create, read, update, and delete account information.
- Input validation and error handling.

## Table Structure 

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(100) NOT NULL,
    account_type ENUM('Checking', 'Savings', 'Business', 'Loan') NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    opening_date DATE NOT NULL,
    last_transaction_date DATE,
    status ENUM('Active', 'Inactive') NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    user_id int NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth (     
    id INT AUTO_INCREMENT PRIMARY KEY,     
    name VARCHAR(100) NOT NULL,     
    email VARCHAR(100) UNIQUE NOT NULL,     
    phone VARCHAR(10) NOT NULL,     
    address VARCHAR(255) NOT NULL,     
    state VARCHAR(50) NOT NULL,     
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);


## Run command

- node app.js