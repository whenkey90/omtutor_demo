package com.mathtutor.model;

import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

/**
 * Created by venkatesh on 05-01-2018.
 */
@Entity
public class Role implements Serializable, GrantedAuthority{

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid")
    private String id;

    @Column(unique = true)
    @NotNull
    private String name;

    private String description;

    @ManyToMany(mappedBy="roles")
    private List<UserAccount> usersAccounts;

    @Override
    public String getAuthority() {
        return this.name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<UserAccount> getUsersAccounts() {
        return usersAccounts;
    }

    public void setUsersAccounts(List<UserAccount> usersAccounts) {
        this.usersAccounts = usersAccounts;
    }
}
