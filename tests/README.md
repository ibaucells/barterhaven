# Manual Tests

| #  | Action                                                                                       | Expected Result                                                                                                                |
| ---|----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| 1  | Click **Register** on the top right of the page                                             | Registration form is displayed                                                                                                 |
| 2  | Fill in the registration form with valid info and click **Submit**                          | Message "User registered successfully" appears and you're redirected to login                                                  |
| 3  | Try registering again with the same email                                                  | Error message "User already exists" is shown                                                                                   |
| 4  | Log in with the newly created credentials                                                  | You are logged in and redirected to the homepage                                                                               |
| 5  | Try logging in with invalid or incorrect credentials                                       | Error message indicating login failure is shown                                                                               |
| 6  | Click **Add Product** and submit a new product with image(s)                               | Product appears on the homepage                                                                                                |
| 7  | Browse products from other users using the available filters                               | Products are displayed according to the selected filters                                                                       |
| 8  | Choose **See More** on a product from another user and click the heart icon                | The heart icon is marked, and the product is added to your "Liked" list accessible from the top right menu when hovering over your profile image |
| 9  | Go to a product from another user and click **Exchange Items**                            | You can see the exchange option; clicking the "Exchange Proposal" button at the top right of the page shows exchange actions   |
| 10 | If another user has proposed an exchange involving your item, go to **Exchange Proposals** | You can see received exchange requests and select one of your items to exchange with the proposed item from the other user      |
| 11 | Edit a product you already added by clicking the **Edit** button                           | Product edit form is displayed; changes are saved and reflected in your product list                                           |
| 12 | View a product that is NOT yours                                                          | **Edit** and **Delete** buttons are hidden; only **Exchange** and **Like** buttons are visible                                  |
| 13 | Edit your profile via the top right user menu                                             | Profile edit form appears; changes are saved correctly                                                                         |
| 14 | Access your items and liked items via the top right user menu                             | Your added products and liked products are displayed correctly                                                                 |
| 15 | Log out using the top right user menu                                                    | You are logged out and redirected to the login page                                                                            |

---


# Automatic Tests

To run the automatic tests:

1. Start the backend server by running:  
 ```bash
node backend/server.js
``` 

2. In the tests folder, execute:
```bash
node run-tests.cjs
```