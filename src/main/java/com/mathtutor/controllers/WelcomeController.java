package com.mathtutor.controllers;

import java.util.Map;

import com.mathtutor.model.ContactUs;
import com.mathtutor.model.UserAccount;
import com.mathtutor.repositories.ContacUsRepository;
import com.mathtutor.repositories.UserRepository;
import com.mathtutor.services.PasswordUtil;
import com.mathtutor.services.UserService;
import com.mathtutor.thymeleaf.Layout;
import org.apache.catalina.servlet4preview.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class WelcomeController {

	@Autowired
	private ContacUsRepository contacUsRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private PasswordUtil passwordUtil;

	// inject via application.properties
	@Value("${welcome.message:test}")
	private String message = "Hello World";

	@RequestMapping("/")
	public String welcome(Map<String, Object> model) {
		model.put("message", this.message);
		return "welcome";
	}

	@RequestMapping("/home")
	public String index() {
		return "home";
	}

	@RequestMapping("/about")
	public String about() {
		return "about";
	}

	@RequestMapping("/login")
	public String login(String error, String logout, Model model) {
		if (error != null) {
			model.addAttribute("error", "Invalid Credentials provided.");
		}

		if (logout != null) {
			model.addAttribute("message", "Logged out from OmTutor successfully.");
		}
		return "login";
	}

//	@Layout("layouts/omt_layout/index")
	@RequestMapping("/feedback")
	public String feedback(Model model) {
		model.addAttribute("contactUs", new ContactUs());
		return "feedback";
	}

	@RequestMapping(value = "/feedback", method = RequestMethod.POST)
	public String save(@ModelAttribute ContactUs contactUs) {
		contacUsRepository.save(contactUs);
		return "feedback";
	}

	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public String register(@ModelAttribute UserAccount userAccount) {
		userAccount.setPassword(passwordUtil.cook(userAccount.getPassword()));
		userService.saveUser(userAccount);
		return "register";
	}

	@RequestMapping(value = "/register", method = RequestMethod.GET)
	public String register(Model model) {
		model.addAttribute("userAccount",new UserAccount());
		return "register";
	}

	@RequestMapping(value = "/problem", method = RequestMethod.GET)
	public String create_problem(Model model) {
		return "create_problem";
	}

	@RequestMapping(value = "/solution", method = RequestMethod.GET)
	public String create_solution(Model model) {
		return "create_solution";
	}

	@RequestMapping(value = "/test_canvas", method = RequestMethod.GET)
	public String test_canvas(Model model) {
		return "test_canvas";
	}

	@Layout("layouts/default/ajax")
	@RequestMapping(value = "/mathPage", method = RequestMethod.GET)
	public String test_canvas(HttpServletRequest request) {
		String page = request.getParameter("page");
		System.out.println(page);
		return "partials/"+page;
	}

	@Layout("layouts/default/ajax")
	@RequestMapping(value = "/getProblem/{page}", method = RequestMethod.GET)
	public String getProblem(@PathVariable String page) {
		System.out.println(page);
		return "partials/"+page;
	}

	@Layout("layouts/omt_layout/index")
	@RequestMapping("/level0")
	public String level0(Model model) {
		return "level0";
	}



}