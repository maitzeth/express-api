// import { NextFunction, Request, Response } from "express";
// import { Product } from '../../../types';

// import { z } from "zod";
// import { errorHandler } from '../../../utils';

// // Blueprint
// const pluePrintProduct = z.object({
//   title: z.string({
//     required_error: "Title is required",
//     invalid_type_error: "Title must be a string",
//   }).max(100),
//   price: z.number({
//     required_error: "Price is required",
//     invalid_type_error: "Price must be a number",
//   }).positive(),
// }).required({
//   title: true,
//   price: true,
// });