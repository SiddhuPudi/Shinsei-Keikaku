import prisma from "../config/prisma.js";

export const getTransaction = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                date: "desc",
            },
        });
        const formatted = transactions.map((tx) => ({
            ...tx,
            amount: Number(tx.amount),
            
        }));
        res.status(200).json({
            success: true,
            transactions: formatted,
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createTransaction = async (req, res) => {
    try {
        const {
            description,
            category,
            amount,
            type,
            date,
        } = req.body;
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                description,
                category,
                amount,
                type,
                date: new Date(date),
            },
        });
        res.status(201).json({
            success: true,
            transaction: {
                ...transaction,
                amount: Number(transaction.amount),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteTransaction = async(req, res) => {
    try{
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: req.params.id,
            },
        });
        if (!transaction) {
            res.status(404).json({
                success: false,
                message: "Not authorized",
            });
        }
        await prisma.transaction.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({
            success: true,
            message: "Transaction deleted",
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};