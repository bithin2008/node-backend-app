const express = require("express");
const jwt = require('jsonwebtoken');
const db = require("../models/index");

const verifySystemAdminToken = async (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.status(401).send({ status: 0, message: "System Admin not authorized" });

    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, response) => {
        if (err) {
            res.status(498).json({ status: 0, message: 'Invalid Access Token' });
        } else {
            if (!response.system_administrator_id) {
                res.status(498).json({ status: 0, message: 'Invalid Access Token' });

            } else {


                let isExist = await db.systemAdministratorsModel.findOne({ where: { token: token, system_administrator_id: parseInt(response.system_administrator_id) } });
                isExist = JSON.parse(JSON.stringify(isExist));
                if (isExist) {
                    if (isExist.is_system_admin == 1) {
                        req.tokenData = response;
                        req.tokenData['token'] = token;
                        next()
                    } else {
                        return res.status(200).send({ status: 0, message: 'User is not system admin' });
                    }
                } else {
                    res.status(498).json({ status: 0, message: 'Invalid Access Token' });
                }

            }
        }
    })

}

module.exports = verifySystemAdminToken;