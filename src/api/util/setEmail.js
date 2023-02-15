const nodemailer = require("nodemailer");
setEmail = async (massage ,  asunto = 'informe de error  in the  app  vela novelas '   ) => {
  const config = {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "velanovelasgratis@gmail.com",
      pass: "tusnkmsqzzvsflmf",
    },
  };
  const trasport = nodemailer.createTransport(config);

  const mensaje = {
    from: "velanovelasgratis@gmail.com",
    to: "mancillaandres7@gmail.com",
    subject: asunto ,
    text: massage,
  };

  await trasport.sendMail(mensaje);
};

module.exports = {
  setEmail,
};
