package com.mathtutor.services;

import com.mathtutor.model.UserAccount;
import com.mathtutor.repositories.RoleRepository;
import com.mathtutor.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Created by venkatesh on 05-01-2018.
 */
@Service
public class UserService implements UserDetailsService{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserAccount user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException(String.format("No user found with username '%s'.", username));
        } else {
            return user;
        }
    }

    public UserAccount saveUser(UserAccount userAccount) {
        userAccount.setRoles(roleRepository.getDefaultRoles());
        return userRepository.save(userAccount);
    }
}