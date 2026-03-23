export const signupOtpTemplate = (
  name: string,
  otp: string,
  minutes: number,
) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f5f0ff 0%, #f8e6f7 100%);">
    <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 40px rgba(115, 3, 107, 0.15);">
      
      <!-- Header with Original Logo and Brand -->
      <div style="background: linear-gradient(135deg, #73036b 0%, #9a0f8f 100%); padding: 30px 20px; text-align: center;">
        <!-- Original Logo Image - Replace the src with your actual logo URL -->
        <img src="YOUR_LOGO_URL_HERE" alt="Libas Logo" style="width: 100px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);" />
        
        <h1 style="color: white; margin: 10px 0 5px; font-size: 36px; font-weight: 600; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); letter-spacing: 1px;">LIBAS</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; letter-spacing: 2px; font-weight: 300;">by Zivore Apparel Pvt. Ltd.</p>
        <div style="margin-top: 10px;">
          <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 50px; color: #ffd700; font-size: 12px; font-weight: 500; letter-spacing: 1px;">WOMEN'S ENTERPRISE</span>
        </div>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px; background: white;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="background: #f0e6ff; color: #73036b; padding: 8px 25px; border-radius: 50px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 5px rgba(115,3,107,0.1);">✨ WELCOME TO LIBAS ✨</span>
        </div>
        
        <h2 style="color: #73036b; font-size: 32px; font-weight: 600; margin: 0 0 10px; text-align: center;">Hello ${name}! 👋</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.8; text-align: center; margin-bottom: 30px;">We're absolutely thrilled to have you join our community at Libas, where fashion meets elegance!</p>
        
        <div style="background: linear-gradient(135deg, #f9f0ff 0%, #fce4fc 100%); border-radius: 25px; padding: 35px; text-align: center; border: 2px dashed #73036b; margin: 30px 0; position: relative;">
          <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: white; padding: 5px 20px; border-radius: 50px; box-shadow: 0 2px 10px rgba(115,3,107,0.2);">
            <span style="color: #73036b; font-size: 14px; font-weight: 600;">VERIFICATION CODE</span>
          </div>
          <p style="color: #73036b; font-size: 16px; margin: 20px 0 15px; font-weight: 500;">Your Secret Key to Unlock Libas ✨</p>
          <div style="background: white; padding: 20px 30px; border-radius: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(115, 3, 107, 0.2);">
            <h1 style="color: #73036b; font-size: 52px; letter-spacing: 8px; margin: 0; font-weight: 700; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #73036b; font-size: 14px; margin: 25px 0 0; font-weight: 500; background: rgba(255,255,255,0.5); padding: 8px; border-radius: 50px;">
            ⏰ This magical code expires in ${minutes} minutes
          </p>
        </div>

        <div style="background: #f8f8f8; border-radius: 20px; padding: 20px 25px; margin: 20px 0;">
          <p style="color: #73036b; margin: 0 0 5px; font-size: 14px; font-weight: 600;">🌟 Our Promise</p>
          <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">"Empowering women through elegant fashion, one stitch at a time."</p>
        </div>
      </div>

      <!-- Footer with HR Details -->
      <div style="background: #fafafa; padding: 30px; border-top: 3px solid #73036b;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; background: white; padding: 15px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03);">
          <div style="background: #73036b; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px;">👩</span>
          </div>
          <div>
            <p style="color: #999; margin: 0; font-size: 13px;">Your HR Partner</p>
            <p style="color: #73036b; margin: 3px 0 0; font-size: 20px; font-weight: 600;">Pallavi Manna</p>
            <p style="color: #666; margin: 3px 0 0; font-size: 13px;">Human Resources</p>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #ddd; padding-top: 20px; margin-top: 20px;">
          <div style="background: #f0e6ff; border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px;">
            <p style="color: #73036b; margin: 0 0 5px; font-size: 14px; font-weight: 600; letter-spacing: 1px;">📱 QR CODE FEATURE</p>
            <p style="color: #666; margin: 0; font-size: 13px;">Coming Soon! Get ready for seamless scanning ✨</p>
            <div style="width: 60px; height: 60px; background: white; border-radius: 10px; margin: 10px auto 0; display: flex; align-items: center; justify-content: center; border: 2px dashed #73036b;">
              <span style="color: #73036b; font-size: 12px;">QR</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <p style="color: #73036b; font-size: 14px; font-weight: 600; margin: 10px 0 5px;">Zivore Apparel Private Limited</p>
            <p style="color: #999; font-size: 12px; margin: 2px 0;">Empowering Women's Fashion Since 2020</p>
            <p style="color: #ccc; font-size: 11px; margin-top: 15px;">© 2024 Libas. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const forgotOtpTemplate = (otp: string, minutes: number) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f5f0ff 0%, #f8e6f7 100%);">
    <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 40px rgba(115, 3, 107, 0.15);">
      
      <div style="background: linear-gradient(135deg, #73036b 0%, #9a0f8f 100%); padding: 25px 20px; text-align: center;">
        <!-- Original Logo Image - Replace the src with your actual logo URL -->
        <img src="YOUR_LOGO_URL_HERE" alt="Libas Logo" style="width: 80px; height: auto; margin-bottom: 10px; filter: brightness(0) invert(1);" />
        <h2 style="color: white; margin: 5px 0; font-size: 28px;">LIBAS</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">Zivore Apparel Pvt. Ltd.</p>
      </div>

      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="background: #ffe6e6; color: #d63031; padding: 8px 25px; border-radius: 50px; font-size: 14px; font-weight: 600;">🔐 PASSWORD RESET REQUEST</span>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.8; text-align: center;">Don't worry! We've got you covered. Here's your password reset code:</p>
        
        <div style="background: #fff5f5; border-radius: 25px; padding: 35px; text-align: center; border: 2px solid #73036b; margin: 30px 0; position: relative;">
          <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 5px 20px; border-radius: 50px; box-shadow: 0 2px 10px rgba(115,3,107,0.1);">
            <span style="color: #73036b; font-size: 13px;">RESET OTP</span>
          </div>
          <div style="background: white; padding: 20px 30px; border-radius: 15px; display: inline-block; box-shadow: 0 5px 15px rgba(115,3,107,0.1);">
            <h1 style="color: #73036b; font-size: 48px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
            
          </div>
          <p style="color: #73036b; font-size: 14px; margin: 25px 0 0;">⏰ Valid for ${minutes} minutes only</p>
        </div>

        <div style="background: #f8f8f8; border-radius: 15px; padding: 20px;">
          <p style="color: #666; margin: 0; font-size: 13px; text-align: center;">⚠️ Never share this code with anyone. Our team will never ask for your OTP.</p>
        </div>
      </div>

      <div style="background: #fafafa; padding: 25px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #73036b; margin: 0 0 5px; font-size: 16px; font-weight: 600;">Pallavi Manna</p>
        <p style="color: #666; margin: 0; font-size: 13px;">HR Manager, Zivore Apparel Pvt. Ltd.</p>
        <div style="margin-top: 15px;">
          <span style="background: #f0e6ff; color: #73036b; padding: 5px 15px; border-radius: 50px; font-size: 11px;">QR Code Coming Soon ✨</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const referralNotifyTemplate = (
  referrerName: string,
  jobTitle: string,
) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f5f0ff 0%, #f8e6f7 100%);">
    <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 40px rgba(115, 3, 107, 0.15);">
      
      <div style="background: linear-gradient(135deg, #73036b 0%, #9a0f8f 100%); padding: 30px 20px; text-align: center;">
        <!-- Original Logo Image - Replace the src with your actual logo URL -->
        <img src="YOUR_LOGO_URL_HERE" alt="Libas Logo" style="width: 90px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);" />
        <h1 style="color: white; margin: 5px 0; font-size: 32px;">LIBAS</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 12px;">Zivore Apparel Pvt. Ltd.</p>
      </div>

      <div style="padding: 40px 30px;">
        <div style="text-align: center;">
          <span style="background: #e3f2fd; color: #1976d2; padding: 8px 25px; border-radius: 50px; font-size: 14px; font-weight: 600;">🎯 YOU'VE BEEN REFERRED!</span>
        </div>
        
        <h2 style="color: #73036b; font-size: 28px; margin: 30px 0 20px; text-align: center;">Great Opportunity Awaits! 🎉</h2>
        
        <div style="background: linear-gradient(135deg, #f9f0ff 0%, #fce4fc 100%); border-radius: 25px; padding: 35px; margin: 20px 0;">
          <p style="color: #333; font-size: 18px; margin: 0 0 15px; text-align: center;">
            <span style="font-weight: 700; color: #73036b; font-size: 22px;">${referrerName}</span> 
            <span style="color: #666;">has referred you for:</span>
          </p>
          <div style="background: white; border-radius: 20px; padding: 20px; text-align: center; box-shadow: 0 5px 15px rgba(115,3,107,0.1);">
            <h3 style="color: #73036b; font-size: 26px; margin: 0;">${jobTitle}</h3>
            <p style="color: #999; margin: 10px 0 0; font-size: 14px;">Position at Libas</p>
          </div>
        </div>

        <div style="text-align: center; margin: 35px 0;">
          <a href="#" style="background: #73036b; color: white; padding: 16px 45px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(115, 3, 107, 0.3);">Login to Portal ✨</a>
        </div>
        
        <div style="background: #f8f8f8; border-radius: 15px; padding: 15px;">
          <p style="color: #666; margin: 0; font-size: 13px; text-align: center;">Login to view complete job details and apply!</p>
        </div>
      </div>

      <div style="background: #fafafa; padding: 25px; border-top: 3px solid #73036b;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div>
            <p style="color: #73036b; margin: 0; font-weight: 600; font-size: 16px;">Pallavi Manna</p>
            <p style="color: #666; margin: 5px 0 0; font-size: 13px;">HR, Zivore Apparel Pvt. Ltd.</p>
          </div>
          <div style="background: #f0e6ff; padding: 8px 20px; border-radius: 50px; margin-top: 10px;">
            <p style="color: #73036b; margin: 0; font-size: 12px;">📱 QR Code Feature ✨ Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const referralSuccessTemplate = (
  candidateName: string,
  jobTitle: string,
) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f5f0ff 0%, #f8e6f7 100%);">
    <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 40px rgba(115, 3, 107, 0.15);">
      
      <div style="background: linear-gradient(135deg, #73036b 0%, #9a0f8f 100%); padding: 30px 20px; text-align: center;">
        <!-- Original Logo Image - Replace the src with your actual logo URL -->
        <img src="YOUR_LOGO_URL_HERE" alt="Libas Logo" style="width: 90px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);" />
        <h1 style="color: white; margin: 5px 0; font-size: 32px;">LIBAS</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 12px;">Zivore Apparel Pvt. Ltd.</p>
      </div>

      <div style="padding: 40px 30px;">
        <div style="text-align: center;">
          <span style="background: #e8f5e9; color: #2e7d32; padding: 8px 30px; border-radius: 50px; font-size: 14px; font-weight: 600;">✅ REFERRAL SUCCESSFUL!</span>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 70px; margin-bottom: 20px; line-height: 1;">🎊 ✨ 🎉</div>
          <h2 style="color: #73036b; font-size: 32px; margin: 0 0 10px;">Thank You!</h2>
          <p style="color: #666; font-size: 16px;">Your referral has been submitted successfully</p>
          
          <div style="background: linear-gradient(135deg, #f9f0ff 0%, #fce4fc 100%); border-radius: 25px; padding: 30px; margin: 30px 0;">
            <p style="color: #333; font-size: 18px; margin: 0 0 10px;">You referred</p>
            <h3 style="color: #73036b; font-size: 28px; margin: 10px 0; font-weight: 700;">${candidateName}</h3>
            <div style="background: white; border-radius: 15px; padding: 15px; margin: 15px 0;">
              <p style="color: #73036b; margin: 0; font-size: 20px; font-weight: 600;">${jobTitle}</p>
            </div>
          </div>
        </div>

        <div style="background: #f8f8f8; border-radius: 20px; padding: 20px 25px; margin: 20px 0;">
          <p style="color: #73036b; margin: 0 0 10px; font-size: 16px; font-weight: 600;">💝 What happens next?</p>
          <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.8;">Our HR team will review the profile and reach out to the candidate within 3-5 business days.</p>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 25px; font-style: italic;">Thank you for helping us build a stronger team! 🙏</p>
      </div>

      <div style="background: #fafafa; padding: 25px; border-top: 3px solid #73036b;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div>
            <p style="color: #73036b; margin: 0; font-weight: 600; font-size: 18px;">Pallavi Manna</p>
            <p style="color: #666; margin: 5px 0 0; font-size: 13px;">HR Manager, Zivore Apparel Pvt. Ltd.</p>
          </div>
          <div style="background: #f0e6ff; padding: 8px 20px; border-radius: 50px; margin-top: 10px;">
            <p style="color: #73036b; margin: 0; font-size: 12px;">✨ QR Code Coming Soon</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #ccc; font-size: 11px;">© 2024 Libas - A Zivore Apparel Private Limited Brand</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const interviewScheduledTemplate = (
  candidateName: string,
  jobTitle: string,
  interviewDate?: string,
) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f5f0ff 0%, #f8e6f7 100%);">
    <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 40px rgba(115, 3, 107, 0.15);">
      
      <div style="background: linear-gradient(135deg, #73036b 0%, #9a0f8f 100%); padding: 30px 20px; text-align: center;">
        <img src="YOUR_LOGO_URL_HERE" alt="Libas Logo" style="width: 90px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);" />
        <h1 style="color: white; margin: 5px 0; font-size: 32px;">LIBAS</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 12px;">Zivore Apparel Pvt. Ltd.</p>
      </div>

      <div style="padding: 40px 30px;">
        <div style="text-align: center;">
          <span style="background: #e3f2fd; color: #1976d2; padding: 8px 25px; border-radius: 50px; font-size: 14px; font-weight: 600;">🎯 INTERVIEW SCHEDULED</span>
        </div>
        
        <h2 style="color: #73036b; font-size: 28px; margin: 30px 0 20px; text-align: center;">Hello ${candidateName}! 👋</h2>
        
        <div style="background: linear-gradient(135deg, #f9f0ff 0%, #fce4fc 100%); border-radius: 25px; padding: 35px; margin: 20px 0;">
          <p style="color: #333; font-size: 18px; margin: 0 0 15px; text-align: center;">
            Your interview for <strong style="color: #73036b;">${jobTitle}</strong> has been scheduled!
          </p>
          
          ${
            interviewDate
              ? `
          <div style="background: white; border-radius: 20px; padding: 25px; text-align: center; margin: 20px 0; box-shadow: 0 5px 15px rgba(115,3,107,0.1);">
            <p style="color: #666; margin: 0 0 10px; font-size: 14px;">📅 Date & Time</p>
            <h3 style="color: #73036b; font-size: 24px; margin: 0;">${interviewDate}</h3>
          </div>
          `
              : ""
          }
          
          <div style="background: #fff3e0; border-radius: 15px; padding: 20px; margin: 20px 0;">
            <p style="color: #e67e22; margin: 0 0 10px; font-weight: 600;">✨ Preparation Tips:</p>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Please be available 10 minutes before the scheduled time</li>
              <li>Ensure a stable internet connection if it's a virtual interview</li>
              <li>Have your resume and portfolio ready for reference</li>
            </ul>
          </div>
        </div>

        <div style="background: #f8f8f8; border-radius: 20px; padding: 20px 25px; margin: 20px 0;">
          <p style="color: #73036b; margin: 0 0 10px; font-size: 16px; font-weight: 600;">💝 Need to reschedule?</p>
          <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.8;">If you need to reschedule or have any questions, please reach out to our HR team at hr@libas.in</p>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 25px;">Best of luck with your interview! 🍀</p>
      </div>

      <div style="background: #fafafa; padding: 25px; border-top: 3px solid #73036b;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div>
            <p style="color: #73036b; margin: 0; font-weight: 600; font-size: 16px;">Pallavi Manna</p>
            <p style="color: #666; margin: 5px 0 0; font-size: 13px;">HR Manager, Zivore Apparel Pvt. Ltd.</p>
          </div>
          <div style="background: #f0e6ff; padding: 8px 20px; border-radius: 50px; margin-top: 10px;">
            <p style="color: #73036b; margin: 0; font-size: 12px;">✨ Libas TalentSpark</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #ccc; font-size: 11px;">© 2024 Libas - A Zivore Apparel Private Limited Brand</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const sendInterviewScheduledMail = ({
  candidateEmail,
  referrerEmail,
  candidateName,
  jobTitle,
  interviewDate,
}: {
  candidateEmail: string;
  referrerEmail?: string | null;
  candidateName: string;
  jobTitle: string;
  interviewDate?: string;
}) => {
  return {
    candidate: {
      to: candidateEmail,
      subject: "Interview Scheduled – Libas TalentSpark",
      html: interviewScheduledTemplate(candidateName, jobTitle, interviewDate),
    },
    referrer: referrerEmail
      ? {
          to: referrerEmail,
          subject: "Candidate Interview Scheduled – Libas TalentSpark",
          html: `
        <div style="font-family: Arial; padding:20px">
          <h2 style="color:#73036b">Candidate Interview Scheduled</h2>
          <p>The candidate <b>${candidateName}</b> you referred for <b>${jobTitle}</b> has an interview scheduled.</p>
          ${interviewDate ? `<p><b>Date & Time:</b> ${interviewDate}</p>` : ""}
          <br/>
          <p>Thank you for your referral!</p>
          <p>Regards,<br/>HR Team<br/>Libas TalentSpark</p>
        </div>
      `,
        }
      : null,
  };
};

// Add this new template to your email.templates.ts file

export const interviewReferrerTemplate = (
  candidateName: string,
  jobTitle: string,
  interviewDate?: string,
) => {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 30px; background: white; border-radius: 15px; border-top: 4px solid #73036b;">
    <h2 style="color: #73036b; margin: 0 0 20px;">Candidate Interview Scheduled</h2>
    <p style="color: #444; font-size: 15px; line-height: 1.6;">
      The candidate <strong>${candidateName}</strong> you referred for <strong>${jobTitle}</strong> has an interview scheduled.
    </p>
    ${
      interviewDate
        ? `
    <div style="background: #f0e6ff; border-radius: 10px; padding: 15px 20px; margin: 20px 0;">
      <p style="color: #73036b; margin: 0; font-size: 15px;">📅 <strong>Date & Time:</strong> ${interviewDate}</p>
    </div>`
        : ""
    }
    <p style="color: #666; font-size: 14px; margin-top: 25px;">Thank you for your referral!</p>
    <p style="color: #666; font-size: 14px; margin: 5px 0;">Regards,<br/><strong style="color: #73036b;">HR Team</strong><br/>Libas TalentSpark</p>
  </div>
  `;
};
