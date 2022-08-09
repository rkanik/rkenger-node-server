import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getReasonPhrase } from "http-status-codes";
import { _jwtSecret, _saltRounds } from "@consts";

import { NextFunction, Request, Response } from "express";
import { ExecuteFunction, IError, IResponse, TAnyObject } from "@types";
import { Query, Document } from "mongoose";

export const isObject = (value: any) => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

export const object = (object: TAnyObject<any>) => {
  return {
    partial(...keys: string[]) {
      return keys.reduce((newObject, key) => {
        return {
          ...newObject,
          [key]: object[key],
        };
      }, {});
    },
  };
};

export const token = {
  generate: (data: any, expiresIn = "7d") =>
    jwt.sign(data, _jwtSecret, { expiresIn }),
  verify: (token: string) =>
    new Promise<boolean | any>((res) => {
      jwt.verify(token, _jwtSecret, (err, decoded) =>
        res(err ? false : decoded || false)
      );
    }),
};

export const password = (password: string) => {
  return {
    hash: () =>
      new Promise<{ hash: string; error: Error }>((res) => {
        bcrypt.hash(password, _saltRounds, (error, hash) => {
          res({ hash, error });
        });
      }),
    compare: (string: string) =>
      new Promise<boolean>((res) => {
        bcrypt.compare(string, password, (err, result) => {
          res(err ? false : result);
        });
      }),
  };
};

export const isEmpty = (val: any): boolean => {
  if ([undefined, null, NaN].includes(val)) return true;
  if (typeof val === "string") return !val.trim();
  if (Array.isArray(val)) return !val.length;
  if (isObject(val)) return !Object.keys(val).length;
  return true;
};

export const comparePassword = (encrypted: string, data: string) => {
  return new Promise((resolve) => {
    bcrypt.compare(data, encrypted, (_, same: boolean) => {
      return resolve(same);
    });
  });
};
export class HTTPError extends Error {
  statusCode: number;
  statusText: string;
  message: string;
  constructor(code: number, message: string) {
    super();
    this.message = message;
    this.statusCode = code;
    this.statusText = getReasonPhrase(this.statusCode);
  }
}

export const toError = (code: number, message?: string, errors?: any) => {
  return {
    error: true,
    statusCode: code,
    message,
    errors,
  };
};

export function error() {
  let res = {} as {
    code: number;
    error: IError;
  };
  return {
    code(code: number) {
      res.code = code;
      return this;
    },
    error(err: IError) {
      res.error = { ...err };
      return res;
    },
  };
}

export const toSuccess = (data: any, message?: string) => {
  return {
    ...data,
    message,
    error: false,
  };
};

export const response = (() => {
  const toError = (error: IError, code: number = 500) => ({ code, error });
  const toSuccess = (data: any, code: number = 200) => ({ code, data });
  return {
    status(code: number) {
      return {
        error: (error: IError) => toError(error, code),
        success: (data: any) => toSuccess(data, code),
      };
    },
    error: (error: IError) => toError(error),
    success: (data: any) => toSuccess(data),
  };
})();

export const handleRequest =
  (execute: ExecuteFunction) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Executing the request
      const { error, code, data }: IResponse = await execute(
        req,
        response,
        res
      );

      // Throwing error
      if (error) {
        if (error.errors) return res.status(code).json(error);
        throw new HTTPError(code, error.message);
      }

      // Sending success response
      return res.status(code).json(data);
    } catch (err) {
      console.log(err);
      return next(err);
    }
  };

export const createFind = (
  Model: any,
  query: any
): {
  page: number;
  limit: number;
  find: Query<Document<any>[], Document<any>>;
  count: Query<number, Document<any>>;
} => {
  // Conditions
  let filter: any = {};
  if (query.role) filter.role = query.role;

  // Search
  let hasQ = query.q && query.q !== "";
  if (hasQ) filter.$text = { $search: query.q };

  if (query.where) {
    let where = JSON.parse(query.where);
    filter = { ...filter, ...where };
  }

  let find = Model.find(filter);

  // Sorting
  let sort: any = {};
  if (query.sort)
    sort[query.sort.replace("-", "")] = query.sort.startsWith("-") ? -1 : 1;
  find = find.sort(isEmpty(sort) ? { createdAt: -1 } : sort);

  // Pagination
  let page = query.page ? query.page * 1 : 1;
  let limit = query.limit ? query.limit * 1 : 15;
  let skip = (page - 1) * limit;
  find = find.skip(skip).limit(limit);

  // Projection
  let select = query.select ? query.select.replace(/,/g, " ") : "-__v";

  find = find.select(select);
  const count = Model.countDocuments(filter);

  return { find, count, page, limit };
};

export const paginate = (query: any) => {
  let page = query.page ? query.page * 1 : 1;
  let limit = query["per-page"] ? query["per-page"] * 1 : 15;
  let skip = (page - 1) * limit;
  return { skip, limit, page };
};

const exclusiveSelect = (
  select: string[],
  exclude: string | string[] | undefined
) => {
  if (exclude)
    select = select.concat(Array.isArray(exclude) ? exclude : [exclude]);
  return select.map((sel) => "-" + sel).join(" ");
};

const inclusiveSelect = (
  select: string,
  exclude: string | string[] | undefined
) => {
  let newSelect = select.split(",");
  if (exclude)
    newSelect = newSelect.filter((sel) => {
      return Array.isArray(exclude) ? !exclude.includes(sel) : sel !== exclude;
    });
  return !newSelect.length
    ? exclusiveSelect(["__v"], exclude)
    : newSelect.join(" ");
};

export const selectify = (
  select: string | null,
  exclude?: string | string[]
) => {
  if (!select) return exclusiveSelect(["__v"], exclude);
  return inclusiveSelect(select, exclude);
};

export const createFindOne = (
  Model: any,
  req: any,
  findById: boolean = false
): Query<Document<any>[], Document<any>> => {
  // Conditions
  let filter: any = { _id: req.params._id };
  if (req.query.role) filter.role = req.query.role;

  // Search
  let hasQ = req.query.q && req.query.q !== "";
  if (hasQ) filter.$text = { $search: req.query.q };

  if (req.query.where) {
    let where = JSON.parse(req.query.where);
    filter = { ...filter, ...where };
  }

  let find = findById ? Model.findById(req.params._id) : Model.find(filter);

  // Sorting
  let sort: any = {};
  if (req.query.sort)
    sort[req.query.sort.replace("-", "")] = req.query.sort.startsWith("-")
      ? -1
      : 1;
  find = find.sort(isEmpty(sort) ? { createdAt: -1 } : sort);

  // Pagination
  let page = req.query.page ? req.query.page * 1 : 1;
  let limit = req.query.limit ? req.query.limit * 1 : 15;
  let skip = (page - 1) * limit;
  find = find.skip(skip).limit(limit);

  // Projection
  let select = req.query.select ? req.query.select.replace(/,/g, " ") : "-__v";
  find = find.select(select);

  return find;
};

export const parseMongoError = (errObject: any) => {
  if (!errObject)
    return {
      message: "No Error",
    };
  return {
    message: errObject.message,
    errors: Object.entries(errObject.errors).reduce(
      (acc, [key, val]: [string, any]) => {
        return {
          ...acc,
          [key]: val.message,
        };
      },
      {}
    ),
  };
};
