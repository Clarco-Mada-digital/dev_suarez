"use client";

import { ContactForm } from "@/components/ContactForm";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";

export default function ContactPage() {
  return (
    <div className="min-h-[90vh]">
      {/* En-tête avec image de fond */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Contactez-nous
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Notre équipe est là pour répondre à toutes vos questions. N'hésitez pas à nous contacter pour toute demande d'information.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Fil d'Ariane */}
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb 
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Contact', href: '/contact', active: true }
          ]} 
        />
      </div>

      {/* Section principale */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <ContactForm />
      </div>

      {/* Carte Google Maps */}
      <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-800">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.1234567890123!2d47.5171234!3d-18.9141234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x21f08e9a4f4b4e9d%3A0x4c9b8c5d5d5d5d5d!2sAntananarivo%2C%20Madagascar!5e0!3m2!1sfr!2smg!4v1234567890123!5m2!1sfr!2smg"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      {/* Section CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à démarrer votre projet ?</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Notre équipe est prête à vous accompagner dans la réalisation de vos projets. Contactez-nous dès maintenant pour discuter de vos besoins.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+261343739528" 
              className="bg-white text-blue-700 hover:bg-blue-50 font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              +261 34 37 395 28
            </a>
            <a 
              href="mailto:clarco.dev@mada-digital.net" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Mail className="h-5 w-5" />
              clarco.dev@mada-digital.net
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}