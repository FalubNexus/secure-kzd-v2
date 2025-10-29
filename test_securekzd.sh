#!/bin/bash
# test_securekzd.sh — test complet automatisé de Secure KZD

BASE_URL="http://localhost:4000/api/key"

echo "🔹 Étape 1 : Génération d'une nouvelle clé API..."
API_KEY=$(curl -s -X POST $BASE_URL/generate \
  -H "Content-Type: application/json" \
  -d '{"clientSecret":"secretFort2025"}' | jq -r '.apiKey')

if [ "$API_KEY" == "null" ] || [ -z "$API_KEY" ]; then
  echo "❌ Erreur : impossible de générer une clé API"
  exit 1
fi

echo "✅ Clé API générée : $API_KEY"
echo

echo "🔹 Étape 2 : Chiffrement des données..."
ENCRYPT_RESPONSE=$(curl -s -X POST $BASE_URL/encrypt \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"nom":"Jean","email":"jean@example.com","dob":"1990-01-01"}}')

echo "$ENCRYPT_RESPONSE" > decrypt.json

if [ ! -s decrypt.json ]; then
  echo "❌ Erreur : le chiffrement n'a rien renvoyé"
  exit 1
fi

echo "✅ Données chiffrées sauvegardées dans decrypt.json"
echo

echo "🔹 Étape 3 : Déchiffrement automatique..."
DECRYPT_RESPONSE=$(curl -s -X POST $BASE_URL/decrypt \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @decrypt.json)

echo "✅ Résultat du déchiffrement :"
echo "$DECRYPT_RESPONSE" | jq
echo
