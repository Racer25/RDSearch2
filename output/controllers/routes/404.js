"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ERROR 404
 * Redirect to error 404 page
 * @param {Request} req
 * @param {Response} res
 */
exports.error404 = (req, res) => {
    res.status(404).render("pages/404.ejs");
};
//# sourceMappingURL=404.js.map