import React from 'react';
import style from "../../style.module.css";
import AntButton_primary from "@/components/ui/antButton_primary ";

const EmailValidation = () => {
    return (
        <div className={style.container}>
            <div className={style.Form}>
                <h1 className={style.custom_text}>Password Reset Email Sent</h1>
                <p className={style.custom_subText}>
                    We have sent a link to your email address to reset your password. Please check your inbox and follow the instructions.
                </p>
                <p className={style.custom_subText}>
                    If you don’t see the email, please check your spam or junk folder.
                </p>
            </div>
        </div>
    );
};

export default EmailValidation;