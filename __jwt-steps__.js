/* 
------------objective of JWT(json web token)--------------- 
   is to secure my api

//-------------CREATE TOKEN--------------
 1.client: after user login send user basic info to create token

 server:
 2. installation: npm i jsonwebtoken and import(server site)
 3. jwt.sign(payload,secret, {expireIn: '1h'})
 4. return token to the client side

 client:
 5. after receiving the token store it either http only cookie  or localhost
 6. use a general space onAuthStateChange > AuthProvider
 ---------------------------------------------------------------
      client:  SEND TOKEN TO SERVER(from get method according to email address)
    1. For sensitive api's call(). send authorization headers {authorization: 'Bearer token' }
    -----------------------------------------------------------
             server: VERIFY THE TOKEN
 1.create a function called verifyJWT (middleware)
 2.this function will take 3 params: (req, res, next)
 3. first check whether the authorization headers exists
 4. if not exist: send 401
 5. if exist: get the token out of the authorization header
 6.call jwt.verify (token, secret, (err, decoded) => { })
 if get error: send 401(unauthorized user)
 else: set decoded to the req object so that we can retrieve it later
7. call the next() to go next steps
-------------------------------------------------------------------
in the next function: (/booking)
1.check wether token has the email that matches with the request email
 */