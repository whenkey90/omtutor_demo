package com.mathtutor.config;

import com.mathtutor.model.UserAccount;
import com.mathtutor.repositories.UserRepository;
import com.mathtutor.services.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

/**
 * Created by venkatesh on 12-01-2018.
 */
@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtil passwordUtil;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String name = authentication.getName().toLowerCase();
        String password = passwordUtil.cook(authentication.getCredentials().toString());

        UserAccount userAccount = userRepository.authenticate(name, password);
        if (userAccount != null) {
            return new UsernamePasswordAuthenticationToken(userAccount, password, userAccount.getAuthorities());
        }

        return null;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }

}
