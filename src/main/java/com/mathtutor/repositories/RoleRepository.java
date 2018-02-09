package com.mathtutor.repositories;

import com.mathtutor.model.Role;
import com.mathtutor.model.UserAccount;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by venkatesh on 04-01-2018.
 */
public interface RoleRepository extends CrudRepository<Role, String>{
    @Query("select role from Role role where role.name = 'USER_ROLE'")
    List<Role> getDefaultRoles();
}
