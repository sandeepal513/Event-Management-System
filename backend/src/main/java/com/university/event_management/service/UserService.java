package com.university.event_management.service;

import com.university.event_management.model.User;
import com.university.event_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PublicService publicService;

    private String otp;
    private long otpExpiryTime;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User getUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(Integer id, User updateUser) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        updateUser.setId(id);
        return userRepository.save(updateUser);
    }

    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void generateAndSendOtp(String to) throws UnsupportedEncodingException {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        this.otpExpiryTime = System.currentTimeMillis() * 10 * 60 * 1000;

        this.otp = otp;
        String subject = "Your One-Time Verification Code (OTP) – EventOra";
        String body = "Dear User,\n\n" +
                "We received a request to verify your account.\n" +
                "Please use the following One-Time Password (OTP) to complete the verification process:\n\n" +
                "            " + otp + "\n\n" +
                "This OTP is valid for the next 10 minutes.\n" +
                "If you did not request this, please ignore this email or contact our support team immediately.\n\n" +
                "Thank you,\n" +
                "EventOra Team\n" +
                "support@eventmanagement.com";

        publicService.sendMail(to, subject, body);
    }

    public boolean verifyOtp(String clientOtp) {
        if (otp == null) return false;

        if (System.currentTimeMillis() > otpExpiryTime) {
            otp = null;
            return false;
        }

        if (clientOtp.equals(otp)) {
            this.otp = null;
            return true;
        }
        return false;
    }

    public void sendWelcomeEmail(String to) throws UnsupportedEncodingException {
        String username = to.split("@")[0];
        String subject = "Welcome to EventOra \uD83C\uDF89 Let’s Get Started!";
        String body = "Hi " + username + ",\n" +
                "\n" +
                "Welcome to EventOra! \uD83C\uDF89\n" +
                "\n" +
                "We’re excited to have you join our community where discovering, attending, and organizing amazing events is just a few clicks away.\n" +
                "\n" +
                "With EventOra, you can:\n" +
                "\n" +
                "\uD83C\uDF9F\uFE0F Explore trending and upcoming events\n" +
                "\uD83D\uDCCD Find events near you\n" +
                "\uD83D\uDC65 Connect with communities and organizers\n" +
                "\uD83D\uDEE0\uFE0F Create and manage your own events\n" +
                "\n" +
                "Get started now and make the most of your experience:\n" +
                "\uD83D\uDC49 Browse Events\n" +
                "\uD83D\uDC49 Create Your First Event\n" +
                "\n" +
                "If you have any questions or need help, feel free to reach out to us anytime.\n" +
                "\n" +
                "Let’s make every moment unforgettable!\n" +
                "\n" +
                "Best regards,\n" +
                "Team EventOra \uD83D\uDE80";

        publicService.sendMail(to, subject, body);
    }
}