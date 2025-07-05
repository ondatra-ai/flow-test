# Test Case: User logs in successfully with correct credentials

## Actors

- Unauthenticated user

## Preconditions

- User is not logged in

## Steps

1. Go to login page (/)
2. Enter valid email and password
3. Submit login form

## Expected Results

- User is redirected to the member page (/member)

## Test Data

- Email: \*\*\*\*@example.com
- Password: \*\*\*\*

---

# Test Case: User fails to log in with incorrect credentials

## Actors

- Unauthenticated user

## Preconditions

- User is not logged in

## Steps

1. Go to login page (/)
2. Enter incorrect email and/or password
3. Submit login form

## Expected Results

- User remains on login page
- Error message is displayed

## Test Data

- Email: \*\*\*\*@example.com
- Password: \*\*\*\*

---

# Test Case: User logs out successfully

## Actors

- Authenticated user

## Preconditions

- User is logged in

## Steps

1. Click on logout button/link

## Expected Results

- User is logged out
- User is redirected to login page or home page

## Test Data

- N/A
