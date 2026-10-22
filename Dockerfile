ARG IMAGE
FROM ${IMAGE}
# Bullseye ships no fixed ca-certificates, so the roots Debian 13's fix dropped are disabled the Debian way.
RUN sed -i -E 's#^(mozilla/(emSign_ECC_Root_CA_-_G3|Comodo_AAA_Services_root)\.crt)$#!\1#' /etc/ca-certificates.conf \
 && update-ca-certificates --fresh \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt
ENV NODE_OPTIONS=--use-openssl-ca
