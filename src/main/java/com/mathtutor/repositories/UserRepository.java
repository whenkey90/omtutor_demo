package com.mathtutor.repositories;

import com.mathtutor.model.UserAccount;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by venkatesh on 04-01-2018.
 */
public interface UserRepository extends CrudRepository<UserAccount, String>{
    UserAccount findByEmail(String email);

    @Query("select userAccount from UserAccount userAccount " +
            "where userAccount.email = :email AND userAccount.password = :password")
    UserAccount authenticate(@Param("email") String email,@Param("password") String password);
}
