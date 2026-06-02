import axios from "axios";

const API_URL = "http://localhost:3000/api/finance";
const getAuthHeader = () => {
    const token = localStorage.getItem("shinsei_token");
    return {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    };
};

export const getTransactions = async () => {
    const res = await axios.get(`${API_URL}/transactions`, getAuthHeader());
    return res.data.transactions;
}

export const createTransaction = async (transaction) => {
    const res = await axios.post(
        `${API_URL}/transactions`,
        transaction,
        getAuthHeader()
    );
    return res.data.transaction;
}

export const deleteTransaction = async(id) => {
    await axios.delete(
        `${API_URL}/transactions/${id}`,
        getAuthHeader()
    );
}