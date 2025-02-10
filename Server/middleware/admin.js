const isAdmin = (req, res) => {
  //console.log('User checking admin:', req.query.isAdmin);
  if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
  } else 

  /*if ((req.user.isAdmin !== 'admin')){
          const adminVal = req.user.isAdmin ? req.user.isAdmin :req.query.isAdmin
          console.log(adminVal);*/


          if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

   /* return res.status(403).json({ 
      message: adminVal+' Access densssied. Admin only.',
      userAdminStatus: adminVal 
    });*/
    //console.log(req.user);
    
     // return res.status(403).json({ message: 'Access denied. Admin only.' });
  //}


};

  module.exports = isAdmin;