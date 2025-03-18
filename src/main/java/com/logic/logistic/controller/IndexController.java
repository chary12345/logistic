package com.logic.logistic.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller

public class IndexController {
	  @GetMapping("/")
	    public String index() {
	        
	        return "login.html";
	    }
	  @GetMapping("bookings")
	  public String booking() {
	        
	        return "bookings.html";
	    }
	  
	  @GetMapping("tracking")
	  public String tracking() {
	        
	        return "tracking.html";
	    }
}
