const Token = require('../models/tokenModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require("../utils/appError");
const sendMail = require('../utils/sendMail');
const TokenInfo = require('../models/tokenInfoModel');
const cronJob = require('../utils/cronJob');


var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3})+$/;

function validate_email_address(email) {
    return email.match(mailformat);
}

function validate_token_address(address) {
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}


exports.getAllTokens = async(req, res, next) => {
    try {
        let { status, pair_type, search_str } = req.body;
        
        let doc ;
        console.log(search_str);
        if(search_str)
            search_str = search_str.toUpperCase();
        if(status && pair_type) {
            doc = await Token.find({
                $or:[
                    { name: RegExp(req.body.search_str, 'i') },
                    { symbol: RegExp(req.body.search_str, 'i') }
                ]
            }).where('status').equals(status)
              .where('pair_type').regex(pair_type)
              .sort({ _id : 1 });
        }
        else if(!status && pair_type) {
            doc = await Token.find({
                $or:[
                    { name: RegExp(req.body.search_str, 'i') },
                    { symbol: RegExp(req.body.search_str, 'i') }
                ]
            }).where('pair_type').regex(pair_type)
              .sort({ _id : 1 });
        }
        else if(status && !pair_type) {
            doc = await Token.find({
                $or:[
                    { name: RegExp(req.body.search_str, 'i') },
                    { symbol: RegExp(req.body.search_str, 'i') }
                ]
            }).where('status').equals(status)
              .sort({ _id : 1 });
        }
        else if(search_str) {
            doc = await Token.find({
                $or:[
                    { name: RegExp(req.body.search_str, 'i') },
                    { symbol: RegExp(req.body.search_str, 'i') }
                ]
            }).sort({ _id : 1 });
        }
        else {
            doc = await Token.find().sort({ _id : 1 });
        }

        console.log('get');
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
        
    } catch (error) {
        next(error);
    }
};

exports.getToken = base.getOne(Token);
exports.getTokenBySymbol = async (req, res, next) => {
    try {
        const doc = await Token.findOne(req.body);
        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    }catch(err) {
        next(err);
    }
}
// Don't update password on this 
exports.updateToken = base.updateOne(Token);
exports.deleteToken = async (req, res, next) => {
    try {
        const token = await Token.findOne({_id:req.params.id});
        
        const token1 = await Token.findOne({ symbol: 'ETH' });
        const token2 = await Token.findOne({ symbol: 'DAI' });
        await TokenInfo.deleteMany({
            $or:[
                { token_id: token._id, pair_token: 'DAI' },
                { token_id: token._id, pair_token: 'ETH' },
                { token_id: token1._id, pair_token: token.symbol },
                { token_id: token2._id, pair_token: token.symbol }
            ]});
        
        token.remove();
        res.status(200).json({
            status: 'success',
        });
    }catch(err) {
        next(err);
    }
}

exports.addToken = async(req, res, next) => {
    try {
        const { name, symbol, decimal, pair_type, address, website_url, issuer_name, email_address } = req.body;

        if(!name || !symbol || !pair_type || !website_url || !issuer_name || !email_address) {
            return next(
                new AppError(201, "fail", "Please provide full data"),
                req,
                res,
                next,
            );
        }
        if(!validate_token_address(address)) {
            return next(
                new AppError(201, "fail", "Invalid Token Address"),
                req,
                res,
                next,
            );
        }

        let token = await Token.findOne({ address });

        if(token != null) {
            return next(
                new AppError(201, "fail", "Duplication token address"),
                req,
                res,
                next,
            );
        }

        if(!validate_email_address(email_address)) {
            return next(
                new AppError(201, "fail", "Invalid Email"),
                req,
                res,
                next,
            );
        }
        
        token = await Token.findOne({ name });
        
        if(token != null) {
            return next(
                new AppError(201, "fail", "Duplication token name"),
                req,
                res,
                next,
            );
        }

        const doc = new Token;

        doc.name = name;
        doc.symbol = symbol;
        doc.decimal = decimal;
        doc.pair_type = pair_type;
        doc.address = address;
        doc.website_url = website_url;
        doc.logo_url = '/images/' + req.file.originalname;
        doc.issuer_name = issuer_name;
        doc.email_address = email_address;
        if(symbol == "ETH") {
            doc.status = "approved";
        }
        doc.save();
        
        sendMail(doc);

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.approveToken = async(req, res, next) => {
    try {
        const token = await Token.findOne({ _id: req.params.id });

        if(!token) {
            return next(
                new AppError(201, "fail", "token does not exist"),
                req,
                res,
                next,
            );
        }

        token.status = "approved";
        await token.save();
        
        await cronJob.updateTokenInfo(0);

        sendMail(token);

        res.status(200).json({
            status: "success",
            block: token.status,
        });

    } catch (err) {
        next(err);
    }
}

exports.denyToken = async(req, res, next) => {
    try {
        const token = await Token.findOne({ _id: req.params.id });

        if(!token) {
            return next(
                new AppError(201, "fail", "token does not exist"),
                req,
                res,
                next,
            );
        }

        token.status = "denied";
        token.save();

        const token1 = await Token.findOne({ symbol: 'ETH' });
        const token2 = await Token.findOne({ symbol: 'DAI' });
        await TokenInfo.deleteMany({
            $or:[
                { token_id: token._id, pair_token: 'DAI' },
                { token_id: token._id, pair_token: 'ETH' },
                { token_id: token1._id, pair_token: token.symbol },
                { token_id: token2._id, pair_token: token.symbol }
            ]});

        res.status(200).json({
            status: "success",
            block: token.status,
        });

    } catch (err) {
        next(err);
    }
}

exports.search = async(req, res, next) => {
    try {
        // const token = await Token.find().where('symbol').regex(req.body.search_str);
        const token = await Token.find({
            $or:[
                { name: RegExp(req.body.search_str, 'i') },
                { symbol: RegExp(req.body.search_str, 'i') }
            ]
        }).sort({ _id : 1 });
        //.regex(new RegExp(req.body.search_str, 'i'));
        res.status(200).json({
            status: 'success',
            results: token.length,
            data: {
                data: token
            },
        });
    } catch(err ) {
        next(err);
    }
}

exports.upload = async(req, res, next) => {
    try {
        const token = await Token.findOne({ _id: req.params.id });
        const type = req.body.type;
        console.log(type);
        console.log(req.file.originalname);
        if(type == 'long_version') {
            token.long_version_pdf_url = '/papers/' + req.file.originalname;
        } else {
            token.short_version_pdf_url = '/papers/' + req.file.originalname;
        }
        token.save();

        res.status(200).json({
            status: 'success',
            results: token,
        });
    } catch (error) {
        next(error);
    }
}

exports.uploadLogo = async(req, res, next) => {
    try {
        const token = await Token.findOne({ _id: req.params.id });
        console.log(req.file.originalname);
        token.logo_url = '/images/' + req.file.originalname;
        token.save();

        res.status(200).json({
            status: 'success',
            results: token,
        });
    } catch (error) {
        next(error);
    }
}