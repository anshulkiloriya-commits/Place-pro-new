package com.placepro.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlaceproController {

    @GetMapping("/")
    public String home() {
        return "Backend is Running 🚀";
    }
    
}