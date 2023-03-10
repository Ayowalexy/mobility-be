import dotenv from "dotenv";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

dotenv.config();


const sendTransaactionEmail = async (email, name, amount, transaction_type, person) => {

        const API_KEY = process.env.SG_API;

        sgMail.setApiKey(API_KEY);
       
        const message = {
            to: email,
            from: {
                name: "Mobility Support Team",
                email: "goldenimperialswifttech@gmail.com"
            },
            text: "Hello Sample text",
            subject: "Transaction alert",
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
            
            <head>
                <meta charset="UTF-8">
                <meta content="width=device-width, initial-scale=1" name="viewport">
                <meta name="x-apple-disable-message-reformatting">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta content="telephone=no" name="format-detection">
                <title></title>
                <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
            </head>
            
            <body>
                <div class="es-wrapper-color">
                 
                    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0">
                        <tbody>
                            <tr>
                                <td class="esd-email-paddings" valign="top">
                                    
                                    <table cellpadding="0" cellspacing="0" class="es-content" align="center">
                                        <tbody>
                                            <tr>
                                                <td class="esd-stripe" align="center" esd-custom-block-id="61179">
                                                    <table bgcolor="transparent" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: transparent;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="esd-structure es-p5t es-p10b es-p20r es-p20l" style="background-position: center top;" align="left">
                                                                    <table width="100%" cellspacing="0" cellpadding="0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                                    <table width="100%" cellspacing="0" cellpadding="0">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td class="esd-block-image es-p10b" align="center" style="font-size:0"><a target="_blank" href="https://viewstripo.email/"><img src="https://tlr.stripocdn.email/content/guids/CABINET_b973b22d987cd123ef00929992e4a0fc/images/92101567152395304.png" alt style="display: block;" width="147"></a></td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                   
                                    <table cellpadding="0" cellspacing="0" class="es-content es-visible-amp-html-only" align="center">
                                        <tbody>
                                            <tr>
                                                <td class="esd-stripe esd-checked" align="center" style="background-image:url(https://tlr.stripocdn.email/content/guids/CABINET_b973b22d987cd123ef00929992e4a0fc/images/22041567151743323.png);background-position: center top; background-repeat: no-repeat;" background="https://tlr.stripocdn.email/content/guids/CABINET_b973b22d987cd123ef00929992e4a0fc/images/22041567151743323.png" esd-custom-block-id="61181">
                                                    <table bgcolor="transparent" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="background-color: transparent;">
                                                        <tbody>
                                                            <tr>
                                                                <td class="esd-structure es-p20t es-p20r es-p20l" align="left">
                                                                    <table cellpadding="0" cellspacing="0" width="100%">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                                    <table cellpadding="0" cellspacing="0" width="100%">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td align="center" class="esd-block-spacer" height="73"></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td class="esd-block-text es-p10r es-p10l" bgcolor="transparent" align="center">
                                                                                                    <h2>Thank you for using LAAR</h2>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td class="esd-block-text es-p10t es-p5b es-p20r es-p20l" bgcolor="transparent" align="center">
                                                                                                    <h3>Dear ${name}</h3>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td class="esd-block-text es-p5b es-p10r es-p10l" bgcolor="transparent" align="center">
                                                                                                    ${
                                                                                                        transaction_type === 'fund'
                                                                                                        ? `<p>You just funded your account with ???${amount}</p>`
                                                                                                        : transaction_type === 'credit'
                                                                                                        ? `<p>???${amount} was sent to you from ${person}</p>`
                                                                                                        : transaction_type === 'debit'
                                                                                                        ? `<p>You just sent ???${amount} to ${person}</p>`
                                                                                                        : `<p>Transaction notification</p>`
                                                                                                    }
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td class="esd-block-text es-p5b es-p10r es-p10l" bgcolor="transparent" align="center">
                                                                                                    <p>It this transaction was not initiated by you, please contact support</p>
                                                                                                </td>
                                                                                            </tr>
                                                                                           
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                           
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                   
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
            
            </html>`
        }

        try {
            const response = await sgMail.send(message)
            return response.data
        } catch (e) {
            console.log(e)
        }

}

export default sendTransaactionEmail;