package com.mathtutor.controllers;

import java.util.Map;

import com.mathtutor.model.ContactUs;
import com.mathtutor.repositories.ContacUsRepository;
import com.mathtutor.thymeleaf.Layout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WelcomeController {

	@Autowired
	private ContacUsRepository contacUsRepository;

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

	@Layout("layouts/omt_layout/index")
	@RequestMapping("/contactUs")
	public String contactUs(Model model) {
		model.addAttribute("contactUs", new ContactUs());
		return "contact_us";
	}

	@RequestMapping(value = "/contactUs", method = RequestMethod.POST)
	public String save(@ModelAttribute ContactUs contactUs) {
		contacUsRepository.save(contactUs);
		return "contact_us";
	}

}