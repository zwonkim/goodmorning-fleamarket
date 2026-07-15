# Database Schema

## profiles

-   id
-   email
-   nickname
-   avatar_url
-   created_at

## products

-   id
-   user_id
-   title
-   description
-   price
-   condition
-   created_at

## product_images

-   id
-   product_id
-   storage_path
-   sort_order

## likes

-   user_id
-   product_id
-   created_at

Unique(user_id, product_id)

## comments

-   id
-   product_id
-   user_id
-   content
-   created_at

Relationships

profiles └── products ├── product_images ├── comments └── likes
