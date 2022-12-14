const jwtlogic = require("../middleware/jwtlogic");
const qry = require("../config/query");
const errorCode = require("../config/error");
const con = require("../config/connection");
const pool = con.init();
con.check(pool);

module.exports = {
  searchById: async (id) => {
    searchUserByIdSql = qry.searchUserById(id);
    try {
      rows = await con.selectQuery(searchUserByIdSql, pool);
      if (Object.keys(rows).length == 0) {
        // 해당 id가 없다면 throw
        throw "the user doesn't exist!";
      }
      return rows;
    } catch (err) {
      throw err;
    }
  },

  searchAll: async () => {
    searchAllUserSql = qry.searchAllUser();
    try {
      rows = await con.selectQuery(searchAllUserSql, pool);
      return rows;
    } catch (err) {
      throw err;
    }
  },


  login: async (user) => {
    // 쿼리 내에서 비밀번호 검사 해야함 나중에 바꿀것
    getPasswordByIdSql = qry.getPasswordById(user.id);
    try {
      rows = await con.selectQuery(getPasswordByIdSql, pool);
      // password 가 틀리다면 throw로 err값 던진 후 reject 호출
      if (Object.keys(rows).length == 0) {
        throw "the id doesn't exist!";
      } else if (rows[0]["Password"] != user.password) {
        throw "password error!";
      } else {
        // 로그인 성공 + jwt 토큰 발급
        token = await jwtlogic.sign(user.id);
        return token;
      }
    } catch (err) {
      throw err;
    }
  },

  insert: async (user) => {
    insertUserSql = qry.insertUser(user);
    try {
      await con.transactionQuery(insertUserSql, pool);
      return "Success";
    } catch (err) {
      throw err;
    }
  },

  
  searchUserById: async (id) => {
    searchUserSql = qry.searchUserById(id);
    try{
      rows = await con.selectQuery(searchUserSql, pool);
      return rows;
    } catch (err) {
      throw err;
    }
  },

  verify: (token) => {
    try {
      rows = jwtlogic.verify(token);
      if (rows < 0) {throw(rows)};
      return rows;
    } catch (err) {
      throw err;
    }
  },

  //TODO : update(id 변경, 중복검사) 함수
  update: async (user) => {
    try {
      // 쿼리 내에서 비밀번호 검사 해야함 나중에 바꿀것
      getPasswordByIdSql = qry.getPasswordById(user.original_id);
      rows = await con.selectQuery(getPasswordByIdSql, pool);
      // password 가 틀리다면 throw로 err값 던진 후 reject 호출
      if (Object.keys(rows).length == 0) {
        throw "the id doesn't exist!";

      } else if (rows[0]["Password"] != user.password) {
        throw "password error!";

      } else {
        updateUserSql = qry.updateUser(user);
        if (!(await con.transactionQuery(updateUserSql, pool))) {
          throw "User Update Failed";
        }
      }
    } catch (err) {
      throw err;
    }
  },

  //TODO : delete(id) 함수
  delete: async (user) => {
    deleteUserSql = qry.deleteUser(user.id);
    try {
      await con.transactionQuery(deleteUserSql, pool);
    } catch (err) {
      throw err;
    }
  },
};
