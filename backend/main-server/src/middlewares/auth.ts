import jsonwebtoken from 'jsonwebtoken';

export const authValidator = (req: any, res: any, next: any) => {
   const auth_header =  req.headers?.authorization

   if(!auth_header) {
    res.status(400).json({
        message: "no authorization header"
    })
   }

   const bearerToken: string = auth_header;

   const token: string = bearerToken.split(' ')[1];

   try {
   const payload: any = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY || 'SECRET_KEY');
   req.userId = payload?.userId;
    next();
   } catch(e) {
    res.status(403).json({
        message: 'Unauthorized user'
    })
   }
}