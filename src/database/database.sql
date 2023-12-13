CREATE DATABASE "foodie";
\ c "foodie";
CREATE USER foodie WITH PASSWORD 'foodie' SUPERUSER;
ALTER USER foodie WITH LOGIN;
-- Define types
CREATE TYPE "gender_enum" as ENUM ('male', 'female');
CREATE TYPE "district_enum" as ENUM (
    'Islands',
    'Kwai Tsing',
    'North',
    'Sai Kung',
    'Sha Tin',
    'Tai Po',
    'Tsuen Wan',
    'Tuen Mun',
    'Yuen Long',
    'Kowloon City',
    'Kwun Tong',
    'Sham Shui Po',
    'Wong Tai Sin',
    'Yau Tsim Mong',
    'Central and Western',
    'Eastern',
    'Southern',
    'Wan Chai'
);
CREATE TYPE "budget_enum" as ENUM (
    'below $50',
    'below $100',
    'below $200',
    'below $400',
    'below $800',
    'any'
);
CREATE TYPE "country_enum" as ENUM (
    'Chinese',
    'Cantonese',
    'Taiwanese',
    'Japanese',
    'Korean',
    'Thai',
    'Indonesian',
    'Indian',
    'Vietnamese',
    'American',
    'Italian',
    'French',
    'British',
    'Spanish',
    'German',
    'Belgian',
    'Portuguese',
    'Latin American',
    'Middle Eastern / Mediterranean'
);
CREATE TYPE "day_enum" as ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);
CREATE TYPE "match_status" as ENUM ('invited', 'rejected', 'matched');
-- Tables
CREATE TABLE "users" (
    "id" serial primary key,
    "username" varchar(25),
    "email" varchar(255),
    "password_hash" char(60),
    "avatar" varchar(255),
    "age" int,
    "gender" gender_enum,
    "fav_food" text,
    "disliked_food" text,
    "restaurants" text,
    "interests" text,
    "meal_budget" budget_enum,
    "img1" varchar(20),
    "img2" varchar(20)
);
CREATE TABLE "location" (
    "id" serial primary key,
    "district" district_enum
);
CREATE TABLE "users_location" (
    "id" serial primary key,
    "user_id" integer references "users" ("id"),
    "location_id" integer references "location" ("id")
);
-- Tables for Food Preference
CREATE TABLE "cuisine" (
    "id" serial primary key,
    "country" country_enum
);
CREATE TABLE "users_cuisine" (
    "id" serial primary key,
    "user_id" integer references "users" ("id"),
    "cuisine_id" integer references "cuisine" ("id")
);
CREATE TABLE "users_available_day" (
    "id" serial primary key,
    "user_id" integer references "users" ("id"),
    "day" day_enum,
    "breakfast" boolean,
    "brunch" boolean,
    "lunch" boolean,
    "tea" boolean,
    "dinner" boolean,
    "lateNight" boolean
);
-- Tables for Match Records
CREATE TABLE "match_records" (
    "id" serial primary key,
    "user1_id" integer references "users" ("id"),
    "user2_id" integer references "users" ("id"),
    "status" match_status,
    "status_date" varchar(255)
);
-- Table for Private Chat Room
create table private_chatrm (
    "id" serial primary key,
    "match_id" integer references match_records(id)
);
create table private_msg (
    "id" serial primary key,
    "room_id" integer references "private_chatrm"(id),
    "sender_id" integer references "users"(id),
    "message" varchar(255) not null,
    "created_at" timestamp not null default current_timestamp,
    "is_deleted" boolean default false
);
-- Inserting Table Data
INSERT INTO LOCATION (district)
VALUES ('Islands'),
    ('Kwai Tsing'),
    ('North'),
    ('Sai Kung'),
    ('Sha Tin'),
    ('Tai Po'),
    ('Tsuen Wan'),
    ('Tuen Mun'),
    ('Yuen Long'),
    ('Kowloon City'),
    ('Kwun Tong'),
    ('Sham Shui Po'),
    ('Wong Tai Sin'),
    ('Yau Tsim Mong'),
    ('Central and Western'),
    ('Eastern'),
    ('Southern'),
    ('Wan Chai');
INSERT INTO cuisine (country)
VALUES ('Chinese'),
    ('Cantonese'),
    ('Taiwanese'),
    ('Japanese'),
    ('Korean'),
    ('Thai'),
    ('Indonesian'),
    ('Indian'),
    ('Vietnamese'),
    ('American'),
    ('Italian'),
    ('French'),
    ('British'),
    ('Spanish'),
    ('German'),
    ('Belgian'),
    ('Portuguese'),
    ('Latin American'),
    ('Middle Eastern / Mediterranean');
CREATE TABLE budgets(
    "id" serial primary key,
    "price_range" budget_enum
);
INSERT INTO budgets (price_range)
VALUES ('below $50'),
    ('below $100'),
    ('below $200'),
    ('below $400'),
    ('below $800'),
    ('any');
-- Tables for Review Records
CREATE TABLE "review" (
    "id" serial primary key,
    "rated_user_id" integer references "users" ("id"),
    "rated_by_user_id" integer references "users" ("id"),
    "rating" int,
    "rating_date" varchar(255),
    "rating_meal" varchar(20),
    "comment" text,
    "reply" text,
    "reply_date" varchar(255)
);