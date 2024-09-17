const express = require('express');

const createError = (status, messsage, success) => {
    const err = new Error();
    err.success = false
    err.status = status
    err.message = messsage;
    return err;

}

module.exports = createError;