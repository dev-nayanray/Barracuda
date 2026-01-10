'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

/**
 * Contact Form Section Component
 * Complete form with validation and API integration
 */
const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    type: '',
    messenger: '',
    username: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  // Messenger options
  const messengerOptions = [
    { value: '', label: 'Select messenger' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'skype', label: 'Skype' },
    { value: 'discord', label: 'Discord' },
    { value: 'email', label: 'Email' },
  ];

  // Type options
  const typeOptions = [
    { value: '', label: 'I am a...' },
    { value: 'publisher', label: 'Publisher / Affiliate' },
    { value: 'advertiser', label: 'Advertiser / Brand' },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Please select your role';
    }
    
    if (formData.messenger && !formData.username.trim()) {
      newErrors.username = 'Username is required when messenger is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://barracuda.marketing/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          type: '',
          messenger: '',
          username: '',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setErrors({ submit: data.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrors({ submit: 'Unable to connect to server. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-4">
              Get in Touch
            </h2>
            <p className="section-subtitle">
              Ready to start your affiliate journey? Our team will get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="card p-8 md:p-10"
          >
            <AnimatePresence mode="wait">
              {submitStatus === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-accent-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-4">
                    Thank You!
                  </h3>
                  <p className="text-text-muted mb-8 max-w-md mx-auto">
                    Your message has been sent successfully. Our team will review your application and get back to you within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitStatus(null)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Submit Error */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{errors.submit}</p>
                    </motion.div>
                  )}

                  {/* Row 1: Name & Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={staggerItem}>
                      <Input
                        label="Full Name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                      />
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                      />
                    </motion.div>
                  </div>

                  {/* Row 2: Company & Type */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={staggerItem}>
                      <Input
                        label="Company Name"
                        name="company"
                        placeholder="Your Company Ltd."
                        value={formData.company}
                        onChange={handleChange}
                        error={errors.company}
                        required
                      />
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <Select
                        label="I am a..."
                        name="type"
                        placeholder="Select your role"
                        value={formData.type}
                        onChange={handleChange}
                        options={typeOptions}
                        error={errors.type}
                        required
                      />
                    </motion.div>
                  </div>

                  {/* Row 3: Messenger & Username */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={staggerItem}>
                      <Select
                        label="Preferred Messenger"
                        name="messenger"
                        placeholder="Select messenger"
                        value={formData.messenger}
                        onChange={handleChange}
                        options={messengerOptions}
                      />
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <Input
                        label={formData.messenger ? `${formData.messenger.charAt(0).toUpperCase() + formData.messenger.slice(1)} Username` : 'Username'}
                        name="username"
                        placeholder={formData.messenger ? `@username` : 'Will be required if messenger selected'}
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        disabled={!formData.messenger}
                      />
                    </motion.div>
                  </div>

                  {/* Row 4: Message */}
                  <motion.div variants={staggerItem}>
                    <Textarea
                      label="Message (Optional)"
                      name="message"
                      placeholder="Tell us about your traffic sources, experience, or any questions you have..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      maxLength={500}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    variants={staggerItem}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      leftIcon={!isSubmitting ? <Send className="w-5 h-5" /> : null}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

