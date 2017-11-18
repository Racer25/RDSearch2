import { Request, Response } from "express";

/**
 * ERROR 404
 * Redirect to error 404 page
 * @param {Request} req
 * @param {Response} res
 */
export let error404 = (req: Request, res: Response) => {
    res.status(404).render("pages/404.ejs");
};