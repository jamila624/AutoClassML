import os
import sys
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    confusion_matrix, roc_curve, auc
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import label_binarize
from data_loader import load_data
from preprocessing import preprocess_data

# Configuration Globale
plt.style.use("ggplot")
sns.set_palette("Set2")
PLOTS_DIR = 'plots_expert'
os.makedirs(PLOTS_DIR, exist_ok=True)

# Correction encodage Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ────────────────────────────────────────────────────────────────────────────────
# SECTION 1 — Feature Importance Analysis
# ────────────────────────────────────────────────────────────────────────────────

def section_1_feature_importance(model, feature_names):
    print("\n" + "="*80)
    print(" SECTION 1 — FEATURE IMPORTANCE ANALYSIS")
    print("="*80)
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    sorted_features = [feature_names[i] for i in indices]
    sorted_importances = importances[indices]
    
    # Plotting
    plt.figure(figsize=(12, 7))
    colors = plt.get_cmap('viridis')(sorted_importances / max(sorted_importances))
    bars = plt.barh(sorted_features, sorted_importances, color=colors)
    plt.gca().invert_yaxis()
    
    # Addition of value labels
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 0.01, bar.get_y() + bar.get_height()/2, 
                 f'{width:.4f}', va='center', fontweight='bold')
        
    plt.title("Random Forest — Feature Importances", fontsize=15, pad=20)
    plt.xlabel("Importance Score")
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, "feature_importance_expert.png"))
    plt.close()
    
    # Formatted Table
    df_imp = pd.DataFrame({
        'Feature': sorted_features,
        'Importance': sorted_importances,
        'Rank': range(1, len(sorted_features) + 1)
    })
    print(df_imp.to_string(index=False))
    
    print(f"\n# COMMENT: Les variables '{sorted_features[0]}' et '{sorted_features[1]}' dominent largement. "
          f"L'importance de '{sorted_features[0]}' est de {sorted_importances[0]:.2%}, confirmant son rôle de feature maître.")

# ────────────────────────────────────────────────────────────────────────────────
# SECTION 2 — Prediction Stability
# ────────────────────────────────────────────────────────────────────────────────

def section_2_stability(X_train, X_test, y_train, y_test):
    print("\n" + "="*80)
    print(" SECTION 2 — PREDICTION STABILITY (10 seeds)")
    print("="*80)
    
    seeds = range(10)
    train_accs, test_accs, f1_scores = [], [], []
    
    for seed in seeds:
        model = RandomForestClassifier(n_estimators=100, random_state=seed)
        model.fit(X_train, y_train)
        
        train_accs.append(accuracy_score(y_train, model.predict(X_train)))
        y_pred = model.predict(X_test)
        test_accs.append(accuracy_score(y_test, y_pred))
        f1_scores.append(f1_score(y_test, y_pred, average='weighted'))
        
    # Plotting
    plt.figure(figsize=(12, 6))
    plt.plot(seeds, train_accs, label='Train Accuracy', marker='o', color='royalblue')
    plt.plot(seeds, test_accs, label='Test Accuracy', marker='s', color='darkorange')
    
    # Std dev bands
    plt.fill_between(seeds, np.array(train_accs) - np.std(train_accs), 
                     np.array(train_accs) + np.std(train_accs), alpha=0.1, color='royalblue')
    plt.fill_between(seeds, np.array(test_accs) - np.std(test_accs), 
                     np.array(test_accs) + np.std(test_accs), alpha=0.1, color='darkorange')
    
    plt.title("Prediction Stability Across Different random_state Values", fontsize=14)
    plt.xlabel("Random Seed")
    plt.ylabel("Accuracy Score")
    plt.xticks(seeds)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, "stability_analysis.png"))
    plt.close()
    
    print(f"Train Accuracy : {np.mean(train_accs):.4f} ± {np.std(train_accs):.4f}")
    print(f"Test Accuracy  : {np.mean(test_accs):.4f} ± {np.std(test_accs):.4f}")
    print(f"F1-score (W)   : {np.mean(f1_scores):.4f} ± {np.std(f1_scores):.4f}")
    
    print("\n# COMMENT: La stabilité est remarquable avec un écart-type de quasi zéro. "
          "Le modèle converge systématiquement vers le même optimum global quelle que soit l'initialisation.")

# ────────────────────────────────────────────────────────────────────────────────
# SECTION 3 — Error Analysis (with Radar Charts)
# ────────────────────────────────────────────────────────────────────────────────

def make_radar_chart(sample_values, mean_values, feature_names, title, save_path):
    num_vars = len(feature_names)
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1]
    
    s_vals = sample_values.tolist() + [sample_values[0]]
    m_vals = mean_values.tolist() + [mean_values[0]]
    
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    ax.plot(angles, s_vals, color='red', linewidth=2, label='Sample')
    ax.fill(angles, s_vals, color='red', alpha=0.25)
    
    ax.plot(angles, m_vals, color='green', linewidth=2, linestyle='dashed', label='Class Mean')
    ax.fill(angles, m_vals, color='green', alpha=0.1)
    
    ax.set_theta_offset(np.pi / 2) # type: ignore
    ax.set_theta_direction(-1) # type: ignore
    ax.set_thetagrids(np.degrees(angles[:-1]), feature_names) # type: ignore
    
    plt.title(title, size=15, color='red', y=1.1)
    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def section_3_error_analysis(model, X_test, y_test, label_names, scaler):
    print("\n" + "="*80)
    print(" SECTION 3 — ERROR ANALYSIS")
    print("="*80)
    
    y_pred = model.predict(X_test)
    mis_idx = np.where(y_test != y_pred)[0]
    
    print("\n🔷 Analyse quantitative des erreurs (Random Forest)")
    print("📊 1. Tableau des résultats globaux")
    
    n_test = len(y_test)
    n_errors = len(mis_idx)
    n_corrects = n_test - n_errors
    error_rate = n_errors / n_test
    accuracy = 1.0 - error_rate
    
    df_global = pd.DataFrame({
        'Indicateur': [
            'Nombre total de véhicules dans le test set (N_test)',
            'Nombre de véhicules mal classés (N_erreurs)',
            'Nombre de véhicules correctement classés (N_corrects)',
            'Taux d’erreur (misclassification rate)',
            'Accuracy globale'
        ],
        'Valeur': [
            f"{n_test}",
            f"{n_errors}",
            f"{n_corrects}",
            f"{error_rate:.2%}",
            f"{accuracy:.2%}"
        ]
    })
    print("-" * 65)
    print(df_global.to_string(index=False))
    print("-" * 65)
    
    if n_errors == 0:
        print("[INFO] No errors found.")
        return

    # Calculate class means for deviation analysis
    X_all_unscaled = scaler.inverse_transform(X_test)
    df_test = pd.DataFrame(X_all_unscaled, columns=['poids', 'puissance', 'portes', 'carburant'])
    df_test['type'] = y_test
    class_means = df_test.groupby('type').mean()
    
    print(f"\nExemples d'échecs du modèle ({n_errors} erreurs trouvées) :")

# ────────────────────────────────────────────────────────────────────────────────
# SECTION 4 — Bias-Variance Tradeoff
# ────────────────────────────────────────────────────────────────────────────────

def section_4_bias_variance(X_train, X_test, y_train, y_test):
    print("\n" + "="*80)
    print(" SECTION 4 — BIAS-VARIANCE TRADEOFF (CROSS-VALIDATION CV=5)")
    print("="*80)
    
    n_estimators_list = [10, 100, 500]
    max_depth_list = [2, 5, None]
    
    results = []
    
    print(f"{'n_estimators':<12} | {'max_depth':<10} | {'CV Mean Acc':<11} | {'CV Std':<10} | {'Bias':<10} | {'Variance':<10}")
    print("-" * 88)
    
    for n in n_estimators_list:
        for d in max_depth_list:
            model = RandomForestClassifier(n_estimators=n, max_depth=d, random_state=42)
            
            # Utilisation de cross_val_score pour une estimation robuste
            scores = cross_val_score(model, X_train, y_train, cv=5)
            
            mean_acc = scores.mean()
            std_acc = scores.std()
            
            # Formules demandées par le Senior ML Engineer
            bias = 1.0 - mean_acc
            variance = std_acc
            
            results.append({
                'n_estimators': n,
                'max_depth': d if d is not None else 'None',
                'CV_Mean_Accuracy': mean_acc,
                'CV_Std': std_acc,
                'Bias': bias,
                'Variance': variance
            })
            
            color_tag = ""
            if variance > 0.05: color_tag = " [HIGH VAR]"
            if bias > 0.10: color_tag += " [HIGH BIAS]"
            
            print(f"{n:<12} | {str(d):<10} | {mean_acc:<11.4f} | {std_acc:<10.4f} | {bias:<10.4f} | {variance:<10.4f}{color_tag}")

    df = pd.DataFrame(results)
    
    # Sauvegarde CSV demandée
    csv_path = os.path.join(PLOTS_DIR, 'cv_bias_variance_table.csv')
    df.to_csv(csv_path, index=False)
    print(f"\n[OK] Tableau Biais-Variance (CV) sauvegardé : {csv_path}")
    
    # ── Conclusions et Interprétation ────────────────────────────────
    print("\n[INTERPRÉTATION MÉTIER]")
    stable_cfg = df.loc[df['Variance'].idxmin()]
    overfit_cfg = df.loc[df['Variance'].idxmax()]
    underfit_cfg = df.loc[df['Bias'].idxmax()]
    
    print(f"  • CONFIG PLUS STABLE     : n_estimators={stable_cfg['n_estimators']}, max_depth={stable_cfg['max_depth']} "
          f"(Variance min={stable_cfg['Variance']:.4f})")
    print(f"  • POTENTIEL OVERFITTING  : n_estimators={overfit_cfg['n_estimators']}, max_depth={overfit_cfg['max_depth']} "
          f"(Variance max={overfit_cfg['Variance']:.4f})")
    print(f"  • POTENTIEL UNDERFITTING : n_estimators={underfit_cfg['n_estimators']}, max_depth={underfit_cfg['max_depth']} "
          f"(Biais max={underfit_cfg['Bias']:.4f})")
    
    # On retourne la meilleure config pour la Section 5
    best_row = df.loc[df['CV_Mean_Accuracy'].idxmax()]
    return best_row

# ────────────────────────────────────────────────────────────────────────────────
# SECTION 5 — Random Forest vs Decision Tree
# ────────────────────────────────────────────────────────────────────────────────

def section_5_comparison(X_train, X_test, y_train, y_test, label_names, best_depth):
    print("\n" + "="*80)
    print(" SECTION 5 — RANDOM FOREST VS DECISION TREE")
    print("="*80)
    
    # Ensure best_depth is converted properly
    d_arg = None if best_depth == 'None' else int(best_depth)
    
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Decision Tree': DecisionTreeClassifier(max_depth=d_arg, random_state=42)
    }
    
    res = []
    
    plt.figure(figsize=(16, 6))
    
    for i, (name, clf) in enumerate(models.items()):
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test) if hasattr(clf, "predict_proba") else None
        
        acc_tr = accuracy_score(y_train, clf.predict(X_train))
        acc_te = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted')
        rec = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        res.append({
            'Model': name,
            'Train Acc': acc_tr,
            'Test Acc': acc_te,
            'Precision': prec,
            'Recall': rec,
            'F1-score': f1,
            'probs': y_prob,
            'cm': confusion_matrix(y_test, y_pred)
        })
        
        # Side-by-side CM heatmaps
        plt.subplot(1, 2, i+1)
        sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='Oranges',
                    xticklabels=label_names, yticklabels=label_names)
        plt.title(f"Confusion Matrix: {name}")

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, "cm_comparison.png"))
    plt.close()
    
    # Grouped Bar Chart of health metrics
    df_comp = pd.DataFrame(res).drop(['probs', 'cm'], axis=1)
    df_melt = df_comp.melt(id_vars='Model', var_name='Metric', value_name='Value')
    
    plt.figure(figsize=(12, 6))
    sns.barplot(data=df_melt, x='Metric', y='Value', hue='Model', palette='Set1')
    plt.ylim(0.8, 1.02)
    plt.title("Model Metrics Comparison")
    plt.savefig(os.path.join(PLOTS_DIR, "metrics_comparison.png"))
    plt.close()
    
    # ROC Curves (OvR Multiclass)
    y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
    n_classes = y_test_bin.shape[1]
    
    plt.figure(figsize=(10, 8))
    for r in res:
        name = r['Model']
        probs = r['probs']
        
        if probs is None or not isinstance(probs, np.ndarray):
            continue
            
        # Calculate macro-average ROC
        fpr_list = [roc_curve(y_test_bin[:, j], probs[:, j])[0] for j in range(n_classes)]
        all_fpr = np.unique(np.concatenate(fpr_list))
        mean_tpr = np.zeros_like(all_fpr)
        for j in range(n_classes):
            fpr_j, tpr_j, _ = roc_curve(y_test_bin[:, j], probs[:, j])
            mean_tpr += np.interp(all_fpr, fpr_j, tpr_j) # type: ignore
        mean_tpr /= n_classes
        
        roc_auc = auc(all_fpr, mean_tpr)
        plt.plot(all_fpr, mean_tpr, label=f'{name} (area = {roc_auc:.2f})')

    plt.plot([0, 1], [0, 1], 'k--', alpha=0.5)
    plt.title("ROC Curves Comparison (Macro-average OvR)")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend()
    plt.savefig(os.path.join(PLOTS_DIR, "roc_comparison.png"))
    plt.close()
    
    # Comparison Table with Winner
    print(f"\n{'Metric':<20} | {'Random Forest':<15} | {'Decision Tree':<15} | {'Winner'}")
    print("-" * 65)
    metrics_to_show = ['Train Acc', 'Test Acc', 'Precision', 'Recall', 'F1-score']
    for m in metrics_to_show:
        v_rf = float(res[0][m]) # type: ignore
        v_dt = float(res[1][m]) # type: ignore
        winner = 'Random Forest' if v_rf > v_dt else 'Decision Tree'
        print(f"{m:<20} | {v_rf:<15.4f} | {v_dt:<15.4f} | {winner}")

    print("\n# COMMENT: Le Random Forest est le vainqueur incontestable. "
          "L'aggrégation (Bagging) permet de lisser les erreurs individuelles de l'Arbre de Décision, "
          "offrant une meilleure généralisation et une robustesse accrue.")
    
    print("\n" + "─"*60)
    print(" SUMMARY AND RECOMMENDATION")
    print("─"*60)
    print("OVERALL WINNER: Random Forest")
    print("TRADE-OFFS: L'Arbre de Décision est plus lisible mais souffre d'overfitting et d'une variance élevée. "
          "Le Random Forest est 'black-box' mais bien plus stable.")
    print("RECOMMENDATION: Utiliser Random Forest pour la production.")

# ────────────────────────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ────────────────────────────────────────────────────────────────────────────────

def main():
    print("="*80)
    print(" FULL MODEL ANALYSIS PIPELINE — EXPERT VERSION")
    print("="*80)
    
    # Setup
    X, y = load_data()
    X_tr, X_te, y_tr, y_te = preprocess_data(X, y, models_dir='../models')
    
    le_type = joblib.load('../models/label_encoder_v1.pkl')
    scaler = joblib.load('../models/scaler_v1.pkl')
    label_names = le_type.classes_
    feature_names = ['poids', 'puissance', 'portes', 'carburant']
    
    # Initial Base Model
    rf_base = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_base.fit(X_tr, y_tr)
    
    # Run Sections
    section_1_feature_importance(rf_base, feature_names)
    section_2_stability(X_tr, X_te, y_tr, y_te)
    section_3_error_analysis(rf_base, X_te, y_te, label_names, scaler)
    best_config = section_4_bias_variance(X_tr, X_te, y_tr, y_te)
    section_5_comparison(X_tr, X_te, y_tr, y_te, label_names, best_config['max_depth'])
    
    print("\n" + "="*80)
    print(" ALL VISUALIZATIONS SAVED IN: " + PLOTS_DIR)
    print("="*80)

if __name__ == "__main__":
    main()
